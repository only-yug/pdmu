
INSERT OR IGNORE INTO users (email, password_hash, name, role, email_verified)
VALUES ('princepatel@example.com', '$2b$10$/6f6j/4wFwzhakwlPwKzR.vvzY/snjGmi1zLA6kvSmcL6xwcxa2mSq', 'Prince Patel', 'admin', 1);

INSERT OR IGNORE INTO alumni_profiles (user_id, roll_number, first_name, last_name, email, phone, degree_type, specialization, current_city, status)
VALUES (
    (SELECT id FROM users WHERE email='princepatel@example.com'),
    '1000', 'Prince', 'Patel', 'princepatel@example.com', '9876543210', 'MBBS', 'Cardiology', 'Ahmedabad', 'claimed'
);

INSERT OR IGNORE INTO users (email, password_hash, name, role, email_verified)
VALUES ('princemakvana@example.com', '$2b$10$/6f6j/4wFwzhakwlPwKzR.vvzY/snjGmi1zLA6kvSmcL6xwcxa2mSq', 'Prince Makvana', 'alumni', 1);

INSERT OR IGNORE INTO alumni_profiles (user_id, roll_number, first_name, last_name, email, phone, degree_type, specialization, current_city, status)
VALUES (
    (SELECT id FROM users WHERE email='princemakvana@example.com'),
    '1001', 'Prince', 'Makvana', 'princemakvana@example.com', '9876543211', 'MBBS', 'Neurology', 'Ahmedabad', 'claimed'
);