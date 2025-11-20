# Deployment Guide - Meal Planner Application

This guide will help you deploy your full-stack Meal Planner application online. We'll use **Render** for backend and **Vercel** for frontend (both free options).

---

## 📋 Prerequisites

1. **GitHub Account** (you already have this)
2. **MongoDB Atlas Account** (free cloud database)
3. **Render Account** (for backend - free tier available)
4. **Vercel Account** (for frontend - free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new **Free Cluster** (M0 - Free tier)
4. Choose a cloud provider and region (closest to you)
5. Click "Create Cluster" (takes 3-5 minutes)

### 1.2 Configure Database Access
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (save these!)
5. Set user privileges to **"Atlas Admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for now, or add specific IPs later)
4. Click **"Confirm"**

### 1.4 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `meal-planner` (or your preferred database name)
7. **Save this connection string** - you'll need it for backend deployment

**Example connection string:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/meal-planner?retryWrites=true&w=majority
```

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `meal-planner` repository
4. Configure the service:
   - **Name**: `meal-planner-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 2.3 Set Environment Variables
In the Render dashboard, go to **Environment** section and add:

```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/meal-planner?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d
PORT=10000
NODE_ENV=production
```

**Important:**
- Replace `MONGO_URI` with your actual MongoDB Atlas connection string
- Replace `JWT_SECRET` with a long random string (use a password generator)
- Keep `PORT=10000` (Render uses this port)

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://meal-planner-backend.onrender.com`
4. **Save this URL** - you'll need it for frontend deployment

### 2.5 Test Backend
Visit your backend URL in browser:
```
https://your-backend-url.onrender.com
```
You should see: `Diet & Meal Planner API is running...`

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Verify your email

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select your `meal-planner` repository

### 3.3 Configure Project
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 3.4 Set Environment Variables
Click **"Environment Variables"** and add:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

**Important:** 
- Replace `your-backend-url.onrender.com` with your actual Render backend URL
- Do NOT include `/api` at the end - the API routes already include it
- Example: `https://meal-planner-backend.onrender.com`

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait for build and deployment (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://meal-planner.vercel.app`
4. Your app is now live! 🎉

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Your Application
1. Visit your frontend URL (e.g., `https://meal-planner.vercel.app`)
2. Try to sign up a new account
3. Test login functionality
4. Check if data is being saved (create a meal plan)

### 4.2 Common Issues & Solutions

**Issue: CORS Error**
- **Solution**: Make sure your backend CORS is configured to allow your frontend domain
- Update `backend/server.js` CORS configuration if needed

**Issue: API Not Found (404)**
- **Solution**: Check that `VITE_API_URL` environment variable is set correctly in Vercel
- Make sure it doesn't include `/api` at the end

**Issue: MongoDB Connection Failed**
- **Solution**: 
  - Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)
  - Check that connection string in Render environment variables is correct
  - Ensure database user password doesn't have special characters that need URL encoding

**Issue: Backend Goes to Sleep (Free Tier)**
- **Solution**: Render free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid tier for always-on service

---

## 🔄 Step 5: Continuous Deployment

Both Render and Vercel automatically deploy when you push to GitHub:

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Automatic deployment** happens within 2-5 minutes
4. **Check deployment logs** in Render/Vercel dashboards

---

## 📝 Step 6: Additional Configuration

### 6.1 Custom Domain (Optional)
- **Vercel**: Go to Project Settings → Domains → Add your domain
- **Render**: Go to Settings → Custom Domains → Add your domain

### 6.2 Environment Variables for Different Environments
You can set different environment variables for:
- **Production**: Main branch deployments
- **Preview**: Pull request deployments
- **Development**: Local development

### 6.3 Database Seeding
After deployment, you may want to seed your database:
1. Connect to your Render backend via SSH (if available)
2. Or run seed script locally pointing to production database (not recommended for security)
3. Or create a one-time deployment script

---

## 🎯 Quick Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and configured
- [ ] Database user created with password
- [ ] Network access configured (allow all IPs)
- [ ] Connection string saved
- [ ] Render account created
- [ ] Backend deployed to Render
- [ ] Environment variables set in Render
- [ ] Backend URL tested and working
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] Frontend URL tested
- [ ] Sign up and login tested
- [ ] Data persistence verified

---

## 💰 Cost Overview

### Free Tier Limits:
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Render**: 750 hours/month, services sleep after inactivity
- **Vercel**: Unlimited deployments, 100GB bandwidth/month

### Estimated Monthly Cost: **$0** (Free tier)

---

## 🆘 Need Help?

If you encounter issues:
1. Check deployment logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Test backend API directly using Postman or browser
4. Check MongoDB Atlas connection status
5. Review error messages in browser console (F12)

---

## 🎉 Congratulations!

Your Meal Planner application is now live on the internet! Share your URL with others and start using your app from anywhere.

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

