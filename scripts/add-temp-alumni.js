const { execSync } = require('child_process');
const crypto = require('crypto');

const email = 'bhavishaamipara1821@gmail.com';
const fullName = 'Bhavisha Amipara';
const id = crypto.randomUUID();

const sql = `INSERT INTO alumni_profiles (id, full_name, email) VALUES ('${id}', '${fullName}', '${email}')`;

try {
    console.log(`Adding ${email} as alumni...`);
    const output = execSync(`npx wrangler d1 execute pdumc-alumni-db --local --command="${sql}"`, {
        encoding: 'utf-8'
    });
    console.log(output);
    console.log('✅ Successfully added to local database.');

    console.log('\n💡 To add to LIVE database, run:');
    console.log(`npx wrangler d1 execute pdumc-alumni-db --remote --command="${sql}"`);
} catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stderr) console.error(error.stderr);
}
