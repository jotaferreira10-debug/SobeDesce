# Deploy Sobe e Desce to the Internet (FREE)

## Steps to Deploy on Render

### 1. Create a GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

Then create a new repo on GitHub and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sobe-e-desce.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render (Free)

1. Go to **https://render.com** and sign up (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `sobe-e-desce`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free (0.50 GB RAM)
5. Click **Deploy**

### 3. Access Your App

Once deployed, you'll get a URL like:
```
https://sobe-e-desce-xxxx.onrender.com
```

Visit that URL in your browser to play!

## How It Works

- **Backend**: Express server running on Render
- **Frontend**: Served as static files from the same server
- **No Database**: All game state is in memory (resets when server restarts)

## Alternative Free Options

- **Railway**: https://railway.app (also free tier)
- **Heroku**: Now requires paid tier (not recommended)
- **Vercel + Netlify**: Frontend only (need separate backend)

## Running Locally for Web

```bash
npm install
npm start
```

Then visit `http://localhost:5000`

## Notes

- Game state resets when server restarts (no persistence)
- Free tier on Render may have slight delays on first load
- Each player's skip history is tracked across rounds correctly
