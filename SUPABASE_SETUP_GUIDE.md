# AfrikSpark Tech Solutions - Complete Supabase Setup Guide

## 🚀 Project Overview
This guide will help you connect your AfrikSpark Tech Solutions website to the new Supabase project and set up the complete backend infrastructure.

## 📋 Prerequisites
- Supabase account
- Access to project: `https://flrnlsceusewzphbyugq.supabase.co`
- Node.js and npm installed

## 🔧 Step-by-Step Setup

### Step 1: Update Supabase Configuration
The project has been configured to use your new Supabase project. The following files have been updated:
- `src/integrations/supabase/client.ts` - Updated URLs and keys
- `supabase/config.toml` - Updated project ID
- `.env` - Created with environment variables

### Step 2: Get Your Supabase Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `flrnlsceusewzphbyugq`
3. Go to **Settings** → **API**
4. Copy your **anon/public** key
5. Update the `.env` file with your actual key:
   ```
   VITE_SUPABASE_PUBLISHABLE_KEY="your_actual_anon_key_here"
   ```

### Step 3: Run the Complete Database Setup
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `complete_supabase_setup.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute all the setup commands

### Step 4: Set Up Admin User
After running the SQL setup:
1. Sign up for an account on your website
2. In Supabase, go to **Table Editor** → **profiles**
3. Find your user record and update the `role` to `'admin'`

### Step 5: Test the Setup
1. Start your development server: `npm run dev`
2. Test the following features:
   - User registration/login
   - Testimonial submission with image upload
   - Community posts
   - Blog management (admin)
   - Contact form submissions

## 📊 Database Tables Created (27 Tables)

### User Management
- `profiles` - User profiles extending auth.users
- `user_roles` - User role assignments

### Community Features
- `community_posts` - Community posts and articles
- `community_comments` - Comments on posts
- `community_likes` - Like system for posts/comments

### Blog System
- `blog_posts` - Blog articles
- `blog_comments` - Blog comments
- `blog_categories` - Blog categories

### Portfolio & Projects
- `projects` - Project showcase
- `project_reviews` - Client testimonials for projects

### Testimonials
- `testimonials` - Customer testimonials with video support

### Services
- `services` - Service offerings
- `service_inquiries` - Service inquiry forms

### Partnerships & Venture Studio
- `partnerships` - Business partnerships
- `venture_studio_projects` - Startup incubation projects
- `venture_applications` - Applications for venture studio

### Communication
- `contact_messages` - Contact form submissions
- `newsletter_subscriptions` - Email subscriptions

### DSS (Data Science Solutions)
- `dss_projects` - Data science projects
- `dss_reports` - DSS deliverables and reports

### Media Management
- `media_files` - Centralized media file registry

### Site Management
- `site_settings` - Dynamic site configuration
- `activity_logs` - User activity tracking

## 🗄️ Storage Buckets Created (14 Buckets)

### Public Buckets (Accessible to all)
- `avatars` - User profile pictures
- `community-media` - Community post images/videos
- `blog-media` - Blog post media
- `project-media` - Project showcase media
- `testimonial-media` - Testimonial images/videos
- `service-media` - Service-related media
- `partnership-logos` - Partner company logos
- `venture-media` - Venture studio project media
- `videos` - General video uploads
- `audio-files` - Audio file uploads

### Private Buckets (Restricted access)
- `contact-attachments` - Contact form file attachments
- `dss-files` - DSS project files and reports
- `documents` - General document storage
- `user-uploads` - Private user file uploads

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Public read access for published content
- ✅ Authenticated users can create content
- ✅ Users can only edit/delete their own content
- ✅ Admins have full access to all content

### Storage Security
- ✅ Public buckets allow public read access
- ✅ Private buckets restrict access to authenticated users
- ✅ Upload permissions based on user roles
- ✅ Secure file URL generation

### Authentication
- ✅ Supabase Auth integration
- ✅ Automatic profile creation on signup
- ✅ Role-based access control
- ✅ Secure password handling

## 📤 Data Flow Architecture

```
User Upload → Supabase Storage Bucket → File URL Generated → Database Table Record → Website Display
```

### Automatic Processing:
1. **File Upload**: User selects file in frontend
2. **Storage**: File uploaded to appropriate Supabase bucket
3. **URL Generation**: Supabase returns public/secure URL
4. **Database**: URL and metadata saved to relevant table
5. **Display**: Content shown on website with proper permissions

## 🛠️ Admin Features

### Content Management
- ✅ Moderate community posts and comments
- ✅ Manage blog posts and categories
- ✅ Handle testimonials and reviews
- ✅ Process service inquiries
- ✅ Review venture studio applications
- ✅ Manage contact form submissions

### User Management
- ✅ View all users and their roles
- ✅ Assign admin/moderator roles
- ✅ Monitor user activity logs

### Site Configuration
- ✅ Dynamic site settings
- ✅ Content moderation tools
- ✅ Analytics and reporting

## 🚨 Important Notes

### Environment Variables
Make sure your `.env` file contains the correct values:
```env
VITE_SUPABASE_URL=https://flrnlsceusewzphbyugq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_anon_key
VITE_SUPABASE_SUPER_ADMIN_EMAIL=your_admin_email
```

### Database Migrations
The SQL setup script includes:
- ✅ All table creations
- ✅ All storage bucket setups
- ✅ All RLS policies
- ✅ Sample data for testing
- ✅ Functions and triggers

### File Upload Limits
- Images: 5MB max per file
- Videos: 100MB max per file (configurable)
- Documents: 10MB max per file

## 🧪 Testing Checklist

After setup, test these features:
- [ ] User registration and login
- [ ] Profile creation and updates
- [ ] Testimonial submission with image upload
- [ ] Community post creation
- [ ] Blog post management (admin)
- [ ] Contact form submission
- [ ] File upload to different buckets
- [ ] Admin dashboard access
- [ ] Content moderation tools

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase keys are correct
3. Ensure the SQL setup ran without errors
4. Check the Supabase dashboard for any policy conflicts

## 🎉 Setup Complete!

Your AfrikSpark Tech Solutions website now has a complete, secure, and scalable backend infrastructure powered by Supabase!