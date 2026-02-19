
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import fetch from 'node-fetch';

const supabaseUrl = 'https://kwxdkuljhwdbwqvzdgpw.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eGRrdWxqaHdkYndxdnpkZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2NjMzNCwiZXhwIjoyMDg2ODQyMzM0fQ.ubb-b68b-CXix1xSS28mXWaC94jzwaX-XTwXXz9mMBw';
const dataDir = 'data-import';
const profilesFiles = ['profiles-export-2026-02-16_14-29-22.csv', 'profiles-export-2026-02-16_15-33-46.csv'];

async function createUser(userData) {
    if (!userData.id || !userData.email) {
        console.log('Skipping record with missing id or email:', userData);
        return;
    }

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: userData.id,
                email: userData.email,
                email_confirm: true,
                user_metadata: {
                    full_name: userData.full_name || '',
                    avatar_url: userData.avatar_url || ''
                }
            })
        });

        const data = await response.json();

        if (response.status >= 400) {
            if (data.msg && data.msg.includes('A user with this email address has already been registered')) {
                console.log(`User with email ${userData.email} already exists. Skipping.`);
            } else if (data.msg && data.msg.includes('A user with this id has already been registered')) {
                 console.log(`User with id ${userData.id} already exists. Skipping.`);
            }else {
                console.error(`Error creating user ${userData.email}:`, data.msg || 'Unknown error');
            }
        } else {
            console.log(`Successfully created user: ${userData.email}`);
        }
    } catch (error) {
        console.error(`An exception occurred while creating user ${userData.email}:`, error);
    }
}

async function main() {
    let allUsers = [];
    for (const fileName of profilesFiles) {
        try {
            const filePath = path.join(dataDir, fileName);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            
            const result = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true
            });

            allUsers = allUsers.concat(result.data);

        } catch (error) {
            console.error(`Error reading or parsing ${fileName}:`, error.message);
        }
    }

    // Deduplicate users by ID
    const uniqueUsers = allUsers.filter((user, index, self) =>
        index === self.findIndex((u) => u.id === user.id)
    );

    if (uniqueUsers.length === 0) {
        console.log('No user profiles found in the CSV files.');
        return;
    }

    console.log(`Found ${uniqueUsers.length} unique user profiles. Starting user creation...`);

    for (const user of uniqueUsers) {
        await createUser(user);
    }

    console.log('\nUser creation process finished.');
}

main();
