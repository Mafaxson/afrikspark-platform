-- Check current user roles
SELECT * FROM user_roles WHERE user_id = '7afaf1b1-0fdc-4346-854e-98934c5ddb10';

-- Grant admin role if missing
INSERT INTO user_roles (user_id, role)
VALUES ('7afaf1b1-0fdc-4346-854e-98934c5ddb10', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify admin role was granted
SELECT * FROM user_roles WHERE user_id = '7afaf1b1-0fdc-4346-854e-98934c5ddb10';