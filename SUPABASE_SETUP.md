# Supabase Setup Instructions

## Current Issue
The Supabase connection is not working properly. Here are the steps to resolve this:

## Step 1: Verify Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if the project `juoyqkqmzshnidszqlaz` exists and is active
3. If not, create a new project

## Step 2: Get Correct Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (should look like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Update Environment Variables
Replace the values in `.env` file with your actual credentials:

```env
VITE_SUPABASE_URL=your_actual_project_url
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

## Step 4: Run Database Migrations
The project includes migration files that need to be applied to your Supabase database:

### Option A: Using Supabase CLI (Recommended)
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

### Option B: Manual SQL Execution
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content from these files in order:
   - `supabase/migrations/20250705155609_shrill_torch.sql`
   - `supabase/migrations/20250705160627_dawn_tooth.sql`
4. Execute each migration

## Step 5: Configure Authentication
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**`
   - **Email confirmation**: Disable for testing (can enable later)

## Step 6: Create Demo Users
After running migrations, create these demo accounts in Supabase Auth:

1. Go to **Authentication** → **Users**
2. Click **Add user** and create:
   - **Admin**: `admin@robostaan.com` / `admin123`
   - **Instructor**: `instructor@robostaan.com` / `instructor123`
   - **Student**: `student@robostaan.com` / `student123`

## Step 7: Test Connection
1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Try to sign up or log in
3. Check browser console for any errors

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Add your domain to allowed origins in Supabase dashboard
   - For development: `http://localhost:5173`

2. **RLS (Row Level Security) Issues**:
   - The migrations include proper RLS policies
   - If you get permission errors, check the policies in Supabase dashboard

3. **Migration Errors**:
   - If tables already exist, you might need to drop them first
   - Or modify the migrations to use `CREATE TABLE IF NOT EXISTS`

4. **Authentication Errors**:
   - Check if email confirmation is disabled for testing
   - Verify the JWT secret is correct

### Alternative: Use Local Supabase
If you continue having issues, you can run Supabase locally:

1. Install Docker
2. Run:
   ```bash
   supabase start
   ```
3. Use the local credentials provided by the CLI

## Production Deployment
When deploying to production:
1. Update environment variables with production Supabase credentials
2. Configure proper redirect URLs
3. Enable email confirmation
4. Set up proper RLS policies for security

## Need Help?
If you're still having issues:
1. Check Supabase logs in the dashboard
2. Verify network connectivity
3. Try creating a fresh Supabase project
4. Contact Supabase support if needed