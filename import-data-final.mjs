
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabaseUrl = 'https://kwxdkuljhwdbwqvzdgpw.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eGRrdWxqaHdkYndxdnpkZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2NjMzNCwiZXhwIjoyMDg2ODQyMzM0fQ.ubb-b68b-CXix1xSS28mXWaC94jzwaX-XTwXXz9mMBw';
const supabase = createClient(supabaseUrl, serviceKey);
const dataDir = 'data-import';

// Function to transform array-like strings into PostgreSQL array literals
const transformValue = (value, header) => {
    if (value === '' || value === 'NULL') {
        return null;
    }
    // Handle array-like strings
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
            // Safely parse the stringified array
            const arr = JSON.parse(value);
            if (Array.isArray(arr)) {
                // Format for PostgreSQL: {"item1","item2"}
                const transformed = arr.map(item => {
                    if (item === null) return 'NULL';
                    // Escape double quotes within the string
                    const escapedItem = String(item).replace(/"/g, '\"\"');
                    return `"${escapedItem}"`;
                }).join(',');
                return `{${transformed}}`;
            }
        } catch (e) {
            // If parsing fails, return the original value and let the DB handle it
            return value;
        }
    }
    return value;
};

async function importFromCsv(filePath) {
    const fileName = path.basename(filePath);
    const tableName = fileName.split('-')[0];
    console.log(`
Attempting to import data for table: ${tableName}`);

    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const result = Papa.parse(fileContent, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            transform: transformValue
        });

        let data = result.data;
        if (data.length === 0) {
            console.log(`No data to import for ${tableName}.`);
            return;
        }

        // For 'profiles', we need to handle the auth.users sync potentially
        if (tableName === 'profiles') {
            // We can't directly create users in auth.users with this method,
            // but we can insert into profiles and hope a trigger exists.
            // Let's remove any columns that might not be in the public profiles table.
            data = data.map(row => {
                delete row.email;
                delete row.phone;
                return row;
            })
        }

        const { data: insertedData, error } = await supabase.from(tableName).upsert(data, {
            onConflict: 'id', // Assumes 'id' is the primary key for most tables
            ignoreDuplicates: true
        });

        if (error) {
            console.error(`ERROR for table ${tableName}:`, error.details || error.message);
        } else {
            console.log(`SUCCESS for table ${tableName}: Imported ${data.length} records.`);
        }
    } catch (error) {
        console.error(`FATAL ERROR processing file ${fileName}:`, error.message);
    }
}

async function main() {
    try {
        const files = await fs.readdir(dataDir);
        let csvFiles = files.filter(file => file.endsWith('.csv'));

        // Manual import order to handle dependencies
        const importOrder = [
            'profiles',
            'deal_rooms',
            'ai_messages',
            'platform_project_imports',
            'contribution_events',
            'xodiak_accounts'
        ];

        // Sort files based on the defined order
        csvFiles.sort((a, b) => {
            const aName = a.split('-')[0];
            const bName = b.split('-')[0];
            const aIndex = importOrder.indexOf(aName);
            const bIndex = importOrder.indexOf(bName);

            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

        console.log('Starting data import with specified order...');
        for (const file of csvFiles) {
            await importFromCsv(path.join(dataDir, file));
        }
        console.log('\nData import process finished.');

    } catch (error) {
        console.error('CRITICAL ERROR in main process:', error.message);
    }
}

main();
