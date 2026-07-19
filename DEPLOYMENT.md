# Deployment Guide - PDF AI

This guide will help you deploy the PDF AI application to production.

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- A Supabase project (create at [supabase.com](https://supabase.com))
- NVIDIA API key (get at [NVIDIA NGC](https://ngc.nvidia.com))
- A Vercel account (recommended) or other hosting platform
- Git installed

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be ready (2-3 minutes)

### 1.2 Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

### 1.3 Create Storage Bucket

1. Navigate to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `documents`
4. Make it public (for file access)
5. Click "Create bucket"

### 1.4 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL (as `NEXT_PUBLIC_SUPABASE_URL`)
   - anon/public key (as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 2: Set Up NVIDIA API

### 2.1 Get NVIDIA API Key

1. Go to [NVIDIA NGC](https://ngc.nvidia.com)
2. Sign up/login
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key (as `NVIDIA_API_KEY`)

### 2.2 Configure NVIDIA Endpoints

The application uses these default NVIDIA NIM endpoints:
- Parse: `https://integrate.api.nvidia.com/v1/metrics/nemotron-parse`
- LLM: `https://integrate.api.nvidia.com/v1/chat/completions`
- Embed: `https://integrate.api.nvidia.com/v1/embeddings`

These can be customized in `.env.local` if needed.

## Step 3: Deploy to Vercel (Recommended)

### 3.1 Push Code to GitHub

1. Initialize git repository (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub
3. Add remote and push:
   ```bash
   git remote add origin https://github.com/your-username/pdf-ai.git
   git branch -M main
   git push -u origin main
   ```

### 3.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NVIDIA_API_KEY=your_nvidia_api_key
   NVIDIA_NIM_PARSE_ENDPOINT=https://integrate.api.nvidia.com/v1/metrics/nemotron-parse
   NVIDIA_NIM_LLM_ENDPOINT=https://integrate.api.nvidia.com/v1/chat/completions
   NVIDIA_NIM_EMBED_ENDPOINT=https://integrate.api.nvidia.com/v1/embeddings
   ```
5. Click "Deploy"
6. Wait for deployment to complete (2-3 minutes)
7. Your site will be live at `https://your-project.vercel.app`

### 3.3 Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued

## Step 4: Alternative Deployment Options

### 4.1 Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy

### 4.2 Deploy to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

### 4.3 Self-Hosted (VPS/Dedicated Server)

1. SSH into your server
2. Install Node.js 18+
3. Clone your repository
4. Install dependencies:
   ```bash
   npm install
   ```
5. Build the application:
   ```bash
   npm run build
   ```
6. Set environment variables in `.env.local`
7. Start the production server:
   ```bash
   npm start
   ```
8. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "pdf-ai" -- start
   pm2 save
   pm2 startup
   ```
9. Set up Nginx as reverse proxy (recommended)

## Step 5: Post-Deployment Configuration

### 5.1 Test the Application

1. Visit your deployed URL
2. Test document upload
3. Test chat functionality
4. Verify AI processing works

### 5.2 Monitor Performance

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API usage (NVIDIA dashboard)
- Check Supabase usage limits

### 5.3 Set Up Analytics (Optional)

- Add Google Analytics
- Set up Mixpanel or similar
- Monitor user behavior

## Step 6: Security Best Practices

### 6.1 Environment Variables

- Never commit `.env.local` to git
- Use different API keys for development and production
- Rotate API keys regularly

### 6.2 Supabase Security

- Update RLS policies for production use
- Enable proper authentication
- Restrict bucket access
- Use service role keys only server-side

### 6.3 Rate Limiting

- Implement rate limiting on API routes
- Use Vercel's built-in rate limiting
- Monitor for abuse

## Step 7: Maintenance

### 7.1 Regular Updates

- Keep dependencies updated:
  ```bash
  npm update
  ```
- Monitor security vulnerabilities:
  ```bash
  npm audit
  ```

### 7.2 Backups

- Enable Supabase automatic backups
- Regular database exports
- Document storage backups

### 7.3 Scaling

- Monitor performance metrics
- Scale up resources as needed
- Consider CDN for static assets

## Troubleshooting

### Common Issues

**Build fails:**
- Check Node.js version (must be 18+)
- Verify all dependencies are installed
- Check environment variables are set

**Supabase connection fails:**
- Verify API URL and key
- Check RLS policies
- Ensure storage bucket exists

**NVIDIA API fails:**
- Verify API key is valid
- Check endpoint URLs
- Monitor API usage limits

**File upload fails:**
- Ensure storage bucket is public
- Check file size limits
- Verify CORS settings

## Support

For issues or questions:
- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Check NVIDIA NIM docs: [docs.nvidia.com](https://docs.nvidia.com)
- Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)

## Cost Estimation

### Supabase (Free Tier)
- 500MB database storage
- 1GB file storage
- 2GB bandwidth/month
- Upgrade: Pro plan starts at $25/month

### NVIDIA NIM
- Pay-as-you-go pricing
- Monitor usage in NGC dashboard
- Typical cost: $0.001-0.01 per request

### Vercel (Hobby Tier)
- Free for personal projects
- 100GB bandwidth/month
- Unlimited deployments
- Upgrade: Pro plan starts at $20/month

### Total Estimated Cost
- Free tier: $0/month
- Production: ~$45-100/month depending on usage
