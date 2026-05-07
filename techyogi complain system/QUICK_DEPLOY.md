# Quick Deploy - One Click Access

## Step 1: Deploy Backend to Render (FREE)

Click this button to deploy the backend automatically:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/techyogi-cms)

**After deployment:**
1. Go to your Render dashboard
2. Click on the service
3. Go to "Environment" tab
4. Add these environment variables:
   - `MONGODB_URI`: Get from MongoDB Atlas (see below)
   - `JWT_SECRET`: Generate at https://generate.plus/en/strong-password (32+ chars)
   - `TWILIO_ACCOUNT_SID`: From Twilio (optional)
   - `TWILIO_AUTH_TOKEN`: From Twilio (optional)
   - `TWILIO_PHONE_NUMBER`: From Twilio (optional)
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary (optional)
   - `CLOUDINARY_API_KEY`: From Cloudinary (optional)
   - `CLOUDINARY_API_SECRET`: From Cloudinary (optional)

Your backend URL will be: `https://techyogi-backend.onrender.com`

## Step 2: Create MongoDB Database (FREE)

1. Go to https://cloud.mongodb.com
2. Sign up with Google
3. Create FREE tier cluster (M0)
4. Create database user
5. Add your IP to Network Access (or allow all: 0.0.0.0/0)
6. Get connection string and add to Render environment variables

## Step 3: Deploy Frontend to Netlify (FREE)

Click this button to deploy the frontend:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/techyogi-cms)

**Or manual upload:**
1. Go to https://app.netlify.com/drop
2. Drag and drop the `frontend/build` folder

Your frontend URL will be: `https://techyogi-cms.netlify.app`

## Step 4: Update Environment Variables

After both are deployed:
1. In Render backend settings, update `FRONTEND_URL` with your actual Netlify URL
2. In Netlify frontend, no changes needed (already points to backend)

## Access Your Application

Once deployed, your links will be:
- **Customer Portal**: https://techyogi-cms.netlify.app
- **Admin Dashboard**: https://techyogi-cms.netlify.app/admin/login
- **Backend API**: https://techyogi-backend.onrender.com/api

## Default Admin Login
- Username: `admin1`
- Password: `admin123`
- OTP will be sent to console (or phone if Twilio configured)

## Need Help?

If deployment fails, check:
1. MongoDB connection string is correct
2. All environment variables are set
3. Free tier limits not exceeded
