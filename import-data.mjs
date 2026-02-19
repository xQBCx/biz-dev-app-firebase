
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwxdkuljhwdbwqvzdgpw.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eGRrdWxqaHdkYndxdnpkZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2NjMzNCwiZXhwIjoyMDg2ODQyMzM0fQ.ubb-b68b-CXix1xSS28mXWaC94jzwaX-XTwXXz9mMBw';
const supabase = createClient(supabaseUrl, serviceKey);
const dataDir = 'data-import';

async function importFromCsv(filePath) {
    const fileName = path.basename(filePath);
    const tableName = fileName.split('-')[0];
    console.log(`
Importing data for table: ${tableName}`);

    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const rows = fileContent.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) {
            console.log('No data to import.');
            return;
        }

        const headers = rows[0].split(';').map(h => h.trim());
        const data = rows.slice(1).map(row => {
            const values = row.split(';').map(v => v.trim());
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
        });

        const { error } = await supabase
            .from(tableName)
            .insert(data, { upsert: true, onConflict: 'id' });

        if (error) {
            console.error(`Error importing data for table ${tableName}:`, error.message);
        } else {
            console.log(`Successfully imported data for table ${tableName}`);
        }
    } catch (error) {
        console.error(`Failed to process file ${fileName}:`, error.message);
    }
}

async function main() {
    try {
        const files = await fs.readdir(dataDir);
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        for (const file of csvFiles) {
            await importFromCsv(path.join(dataDir, file));
        }
    } catch (error) {
        console.error('Error reading data-import directory:', error.message);
    }
}

main();
