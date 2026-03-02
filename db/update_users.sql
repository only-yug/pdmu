
-- 1. Ensure bhavishaamipara164@gmail.com is an ADMIN in the users table
-- We'll use a dummy password hash if it doesn't exist, or just update the role if it does.
INSERT INTO users (id, email, password_hash, role) 
VALUES ('admin-bhavisha-id', 'bhavishaamipara164@gmail.com', '$2b$10$/6f6j/4wFwzhakwlPwKzR.vvzY/snjGmi1zLA6kvSmcL6xwcxa2mSq', 'admin')
ON CONFLICT(email) DO UPDATE SET role='admin';

-- 2. Add bhumaamipara133@gmail.com as a batchmate (Alumni Profile)
INSERT OR IGNORE INTO alumni_profiles (id, full_name, email, roll_number)
VALUES (
    'alumni-bhuma-133', 
    'Bhuva Amipara', 
    'bhumaamipara133@gmail.com', 
    133
);

-- 3. Add bhavup164@gmail.com as a batchmate (Alumni Profile)
INSERT OR IGNORE INTO alumni_profiles (id, full_name, email, roll_number)
VALUES (
    'alumni-bhavu-164', 
    'Bhavu Amipara', 
    'bhavup164@gmail.com', 
    164
);
