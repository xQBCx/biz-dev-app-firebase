
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabaseUrl = 'https://kwxdkuljhwdbwqvzdgpw.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eGRrdWxqaHdkYndxdnpkZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2NjMzNCwiZXhwIjoyMDg2ODQyMzM0fQ.ubb-b68b-CXix1xSS28mXWaC94jzwaX-XTwXXz9mMBw';
const supabase = createClient(supabaseUrl, serviceKey);
const dataDir = 'data-import';

const transformValue = (value) => {
    if (value === '' || value === 'NULL') return null;
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
            const arr = JSON.parse(value);
            if (Array.isArray(arr)) {
                const transformed = arr.map(item => {
                    if (item === null) return 'NULL';
                    // If item is an object, stringify it, otherwise just use the value.
                    let processItem = (typeof item === 'object' && item !== null) ? JSON.stringify(item) : item;
                    // Escape double quotes within the string
                    const escapedItem = String(processItem).replace(/"/g, ''''');
                    return `"${escapedItem}"`;
                }).join(',');
                return `{${transformed}}`;
            }
        } catch (e) {
            return value;
        }
    }
    return value;
};

const onConflictMap = {
    xodiak_accounts: 'address',
    mcp_tools: 'tool_name',
    soc_codes: 'code',
    grid_addons: 'slug',
    license_configs: 'license_id',
    platform_archetypes: 'slug',
    registrar_registry: 'registrar_name',
    service_franchises: 'franchise_code',
    social_platforms: 'platform_name',
    trading_playbooks: 'slug',
    workflow_templates: 'slug',
    instincts_agents: 'slug',
    instincts_user_stats: 'user_id'
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
            transform: transformValue,
        });

        const data = result.data;
        if (data.length === 0) {
            console.log(`No data to import for ${tableName}.`);
            return;
        }

        const onConflictColumn = onConflictMap[tableName] || 'id';
        const batchSize = tableName === 'ai_messages' ? 100 : 1000;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const { error } = await supabase.from(tableName).upsert(batch, { onConflict: onConflictColumn, ignoreDuplicates: false });
            if (error) {
                console.error(`ERROR for table ${tableName} (batch ${i / batchSize + 1}):`, error.details || error.message);
                // Stop processing this file on first batch error to avoid cascade.
                return;
            }
        }
        console.log(`SUCCESS for table ${tableName}: Imported ${data.length} records.`);

    } catch (error) {
        console.error(`FATAL ERROR processing file ${fileName}:`, error.message);
    }
}

async function main() {
    // Same main function as v3, with the manual import order
    try {
        const files = await fs.readdir(dataDir);
        let csvFiles = files.filter(file => file.endsWith('.csv'));
        const importOrder = ['profiles', 'deal_rooms', 'ai_messages', 'platform_project_imports', 'contribution_events', 'xodiak_accounts'];
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

        console.log('Starting data import with specified order and improved error handling...');
        for (const file of csvFiles) {
            await importFromCsv(path.join(dataDir, file));
        }
        console.log('\nData import process finished.');

    } catch (error) {
        console.error('CRITICAL ERROR in main process:', error.message);
    }
}

main();
