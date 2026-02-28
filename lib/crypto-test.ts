import { hashPassword, verifyPassword } from './crypto';

async function test() {
    console.log('Testing crypto functions');
    const password = 'mySecretPassword123';
    try {
        const hash = await hashPassword(password);
        console.log('Hash:', hash);

        const isMatch = await verifyPassword(password, hash);
        console.log('Match with correct password:', isMatch);

        const isMatch2 = await verifyPassword('wrongPassword', hash);
        console.log('Match with wrong password:', isMatch2);

    } catch (e) {
        console.error('Error during crypto test:', e);
    }
}

test();
