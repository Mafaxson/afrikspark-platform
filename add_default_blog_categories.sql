-- Add default blog categories
INSERT INTO blog_categories (category_name, slug, description) VALUES
('Technology', 'technology', 'Latest technology trends and innovations'),
('Education', 'education', 'Educational content and learning resources'),
('Business', 'business', 'Business strategies and entrepreneurship'),
('Community', 'community', 'Community news and updates'),
('Events', 'events', 'Upcoming events and announcements')
ON CONFLICT (slug) DO NOTHING;