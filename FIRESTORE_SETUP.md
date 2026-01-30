# Setup Instructions

## 1. Create .env.local File

Create a file called `.env.local` in the project root with:

```bash
VITE_API_MODE=live
VITE_PAYMENT_MODE=simulation
VITE_APP_ENV=development
```

This tells the app to use Firestore instead of mock data.

## 2. Seed the Database

Follow instructions in `SEEDING_INSTRUCTIONS.md`

## 3. Run Locally

```bash
npm run dev
```

## 4. Deploy

```bash
npm run build
npx firebase deploy --only hosting
```

Your live site: https://kithly-mvp.web.app
