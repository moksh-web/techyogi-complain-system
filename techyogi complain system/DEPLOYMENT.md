# Techyogi Complaint Management System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [SMS/OTP Configuration](#smsotp-configuration)
7. [Cloudinary Setup](#cloudinary-setup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js v16 or higher
- MongoDB v4.4 or higher
- npm or yarn
- Git

### Server Requirements (Production)
- 2GB RAM minimum (4GB recommended)
- 20GB storage minimum
- Ubuntu 20.04 LTS or higher (recommended)
- SSL certificate (for HTTPS)

## Local Development

### Step 1: Clone and Setup
```bash
# Navigate to project directory
cd techyogi-complaint-system

# Install all dependencies
npm run install-all
```

### Step 2: Environment Configuration
1. Copy `.env.example` to `backend/.env`
2. Update the environment variables (see [Environment Variables](#environment-variables))

### Step 3: Start MongoDB
```bash
# On Windows (if MongoDB is installed as service)
net start MongoDB

# On macOS/Linux
mongod --dbpath /path/to/data/db
```

### Step 4: Start Development Server
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run backend  # Backend only
npm run frontend # Frontend only
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Admin Credentials
- Username: `admin1` or `admin2`
- Password: `admin123` (change after first login)
- Admin phones: `+918511150751`, `+917567490201`

## Production Deployment

### Option 1: Deploy to Render/Railway/Heroku (Recommended for Backend)

1. Create an account on Render.com (or Railway/Heroku)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in the dashboard
6. Deploy

### Option 2: Deploy Frontend to Vercel/Netlify

#### Vercel
1. Create an account on Vercel
2. Import your GitHub repository
3. Set the following:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL
5. Deploy

#### Netlify
1. Create an account on Netlify
2. Drag and drop the `frontend/build` folder OR connect GitHub
3. Set build settings if using Git:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
4. Deploy

### Option 3: Self-Hosted (VPS/Dedicated Server)

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

#### Deploy Backend
```bash
# Clone repository
git clone <your-repo-url>
cd techyogi-complaint-system/backend

# Install dependencies
npm install

# Setup environment variables
nano .env

# Start with PM2
pm2 start server.js --name "techyogi-backend"
pm2 save
pm2 startup
```

#### Deploy Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with a static server (install serve if needed)
npm install -g serve
serve -s build -l 3000
```

#### Setup Nginx (Reverse Proxy)
```bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/techyogi
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/techyogi/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/techyogi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Setup SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/techyogi-complaints
# For production with MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techyogi-complaints

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=5000
NODE_ENV=production

# Twilio (for SMS/OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Phone Numbers (comma separated)
ADMIN_PHONES=+918511150751,+917567490201

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Database Setup

### Local MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod

# Access MongoDB shell
mongosh

# Create database (optional, auto-created)
use techyogi-complaints

# Create admin user (optional for local development)
db.createUser({
  user: "techyogi_admin",
  pwd: "your-password",
  roles: [{ role: "readWrite", db: "techyogi-complaints" }]
})
```

### MongoDB Atlas (Cloud)
1. Create account at https://cloud.mongodb.com
2. Create a new cluster (M0 tier is free)
3. Create a database user
4. Add your IP to the whitelist
5. Get the connection string
6. Update `MONGODB_URI` in your backend `.env`

## SMS/OTP Configuration

### Twilio Setup
1. Create account at https://www.twilio.com
2. Get your Account SID and Auth Token from the console
3. Purchase a phone number or use trial number
4. Update `.env` with Twilio credentials
5. For trial accounts, verify recipient phone numbers first

### Alternative: Use Console OTP (Development)
If you don't want to use Twilio during development, the OTP will be logged to the console.

## Cloudinary Setup

1. Create account at https://cloudinary.com
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Update `.env` with Cloudinary credentials
5. Upload folder will be automatically created

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Check if MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `.env`
- Check firewall settings

#### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Include `http://` or `https://` in the URL

#### Image Upload Failed
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure proper file format (JPEG, PNG, WebP)

#### OTP Not Received
- Check Twilio credentials
- Verify phone number format (+91XXXXXXXXXX)
- Check Twilio logs for errors
- For trial accounts, ensure recipient number is verified

#### Build Failures
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (v16+)

#### 401 Unauthorized Errors
- Check if JWT token is expired
- Verify `Authorization` header format: `Bearer <token>`
- Ensure admin phone number is in `ADMIN_PHONES`

### Logs
```bash
# View PM2 logs
pm2 logs techyogi-backend

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Support
For issues, check:
1. Environment variables are set correctly
2. All services are running
3. Network connectivity
4. Firewall rules

## Security Checklist

- [ ] Change default admin passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables (no hardcoded secrets)
- [ ] Regular MongoDB backups
- [ ] Update dependencies regularly

## Backup Strategy

### MongoDB Backup
```bash
# Create backup
mongodump --db=techyogi-complaints --out=/path/to/backup

# Restore backup
mongorestore --db=techyogi-complaints /path/to/backup/techyogi-complaints
```

### Automated Backups
Add to crontab:
```bash
0 2 * * * mongodump --db=techyogi-complaints --out=/backups/techyogi-$(date +\%Y\%m\%d)
```
