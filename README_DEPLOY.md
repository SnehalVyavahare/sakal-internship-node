# 🚀 Render Deployment Guide

## 1️⃣ Push to GitHub
Commit all files and push to a new GitHub repository.

## 2️⃣ Create a Render Web Service
- Go to [https://render.com](https://render.com)
- Click **New + → Web Service**
- Connect your GitHub repo
- Choose **Branch: main**
- Runtime: **Node**
- Build Command: `npm install`
- Start Command: `npm start`

## 3️⃣ Add Environment Variables
Under "Environment", add any variables listed in `.env.example`.

## 4️⃣ Deploy
Click **Deploy Web Service**.
Render will automatically detect your Node app and start it!

---

**Pro Tip:** If you change your code, just push to GitHub — Render redeploys automatically.
