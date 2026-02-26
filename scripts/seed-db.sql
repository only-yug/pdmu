-- Clear existing data
DELETE FROM event_attendees;
DELETE FROM claim_tokens;
DELETE FROM alumni_profiles;
DELETE FROM memories;
DELETE FROM hotels;
DELETE FROM events;
DELETE FROM users;

-- Insert the 3 requested emails as batchmates
-- Using simple strings for IDs is acceptable since it's a primary key text field
INSERT INTO alumni_profiles (id, full_name, email) VALUES 
('seed-nihar', 'Nihar Polara', 'niharpolara9@gmail.com'),
('seed-yug', 'Yug Polara', 'yugpolara06@gmail.com'),
('seed-gtu', 'Batchmate 230760116102', '230760116102@gtu.edu.in');
