// Usage: node scripts/make-admin.js <email>
// Note: This script uses wrangler d1 execute to update the local database.

const { execSync } = require('child_process');

const email = process.argv[2];

if (!email) {
    console.error('\n❌ Please provide an email address.');
    console.error('Usage: node scripts/make-admin.js <email>');
    console.error('Example: node scripts/make-admin.js yug@example.com\n');
    process.exit(1);
}

console.log(`\nPromoting ${email} to Admin...`);

// The SQL command to update the user's role
const sqlCommand = `UPDATE users SET role = 'admin' WHERE email = '${email}'`;

try {
    // Execute via wrangler CLI against the local D1 database
    const result = execSync(`npx wrangler d1 execute pdumc-alumni-db --local --command="${sqlCommand}"`, {
        stdio: 'pipe',
        encoding: 'utf-8'
    });

    // Also update the alumni_profiles table just in case they haven't been linked yet,
    // though the 'admin' check is primarily against the users table.
    const profileSql = `UPDATE alumni_profiles SET fullName = fullName || ' (Admin)' WHERE email = '${email}'`;
    try {
        execSync(`npx wrangler d1 execute pdumc-alumni-db --local --command="${profileSql}"`, { stdio: 'ignore' });
    } catch (e) {
        // Ignore if profile doesn't exist yet
    }

    console.log('✅ Success! The user is now an Admin in your local database.');
    console.log('You can now log in and access http://localhost:3000/admin\n');

    console.log('💡 Note: To make someone an admin in your LIVE Cloudflare database, run:');
    console.log(`npx wrangler d1 execute pdumc-alumni-db --remote --command="UPDATE users SET role = 'admin' WHERE email = '${email}'"\n`);

} catch (error) {
    console.error('\n❌ Failed to execute command. Make sure you are in the project root and wrangler is installed.');
    if (error.stderr) {
        console.error(error.stderr);
    } else {
        console.error(error.message);
    }
}
