
# 🚀 CampusMind MVP Deployment Guide

This project is structured as a **Professional React MVP**. Follow these steps to put it on a real URL.

## 1. Local Setup
1. Download all files to a folder on your computer.
2. Open your terminal in that folder.
3. Run `npm install` to download the engine.
4. Run `npm run dev` to see it locally.

## 2. Deployment (The "Pro" Way)
### Vercel (Recommended)
1. Push this folder to a **GitHub** repository.
2. Go to [Vercel.com](https://vercel.com) and click "Add New Project".
3. Import your GitHub repo.
4. **CRITICAL:** Under "Environment Variables", add:
   - Key: `API_KEY`
   - Value: `[Your-Gemini-API-Key]`
5. Click **Deploy**.

## 3. Upgrading the Backend
Currently, this app uses `api.ts` with `localStorage` (perfect for testing & initial users). To move to a real global database for 10,000+ users:
1. Create a project on [Supabase.com](https://supabase.com).
2. Replace the logic inside `services/api.ts` with Supabase fetch calls.
3. The UI components will stay exactly the same—only the "data pipe" in `api.ts` changes.

---
*Built with CampusMind Engineering Standards.*
