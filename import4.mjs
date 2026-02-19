
import fs from 'fs';

const SUPABASE_URL = 'https://kwxdkuljhwdbwqvzdgpw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eGRrdWxqaHdkYndxdnpkZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2NjMzNCwiZXhwIjoyMDg2ODQyMzM0fQ.ubb-b68b-CXix1xSS28mXWaC94jzwaX-XTwXXz9mMBw';

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const row = {};
    headers.forEach((h, i) => {
        let v = values[i] || '';
        
        // Trim leading/trailing whitespace and quotes from the value
        v = v.trim();
        if (v.startsWith('"') && v.endsWith('"')) {
            v = v.substring(1, v.length - 1);
        }

        if (v === '' || v === 'NULL') {
            row[h] = null;
        } else if (v === 'true') {
            row[h] = true;
        } else if (v === 'false') {
            row[h] = false;
        } else if (v.startsWith('[') && v.endsWith(']')) {
            try {
                const parsed = JSON.parse(v);
                if (Array.isArray(parsed)) {
                    // Convert JS array to postgres array literal string
                    const elements = parsed.map(item => {
                        if (item === null) return 'NULL';
                        const str = String(item);
                        // Escape backslashes and double quotes
                        let escaped = str.replace(/\\/g, '\\').replace(/"/g, '\"');
                        // Quote if it contains special chars, is empty, or has leading/trailing whitespace
                        if (str.includes(',') || str.includes('{') || str.includes('}') || str.includes('"') || str === '' || str.trim() !== str) {
                            escaped = `"${escaped}"`;
                        }
                        return escaped;
                    });
                    row[h] = `{${elements.join(',')}}`;
                } else {
                    row[h] = v; // Not an array, just a string that looks like JSON
                }
            } catch (e) {
                row[h] = v; // Not valid JSON
            }
        } else {
            row[h] = v;
        }
    });
    return row;
  });
}


async function importTable(file, table) {
  console.log('Importing ' + table);
  try {
    const content = fs.readFileSync('data-import/' + file, 'utf-8');
    const data = parseCSV(content);
    if (data.length === 0) {
      console.log(`${table}: SKIPPED - No data to import.`);
      return;
    }
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    console.log(table + ': ' + (res.ok ? 'SUCCESS' : await res.text()));
  } catch (error) {
    if (error.code === 'ENOENT') {
        console.log(`${table}: SKIPPED - File not found: data-import/${file}`);
    } else {
        console.log(`${table}: FAILED - ${error.message}`);
    }
  }
}

await importTable('crm_companies_fixed.csv', 'crm_companies');
await importTable('crm_contacts_fixed.csv', 'crm_contacts');
await importTable('crm_activities_fixed.csv', 'crm_activities');
