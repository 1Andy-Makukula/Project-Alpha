# How to Seed Your Firestore Database

## Prerequisites
- Firestore database created in Firebase Console (test mode)
- Firebase initialized in your project

## Step 1: Disable Mock Mode

Create a `.env.local` file in your project root:

```bash
VITE_API_MODE=live
```

This tells your app to use Firestore instead of mock data.

## Step 2: Run the Seeding Script

You have two options to seed the database:

### Option A: Via Browser Console (Recommended)

1. Start your development server:
```bash
npm run dev
```

2. Open the app in your browser (http://localhost:5173)

3. Open the browser console (F12)

4. Run the following commands:
```javascript
// Import the seed function
import('./scripts/seedFirestore').then(module => {
  // Run the seeding
  module.seedFirestore();
});
```

5. Wait for the success message in the console

### Option B: Create a Temporary Seed Page

1. Create `src/pages/SeedPage.tsx`:
```tsx
import { useState } from 'react';
import { seedFirestore } from '../scripts/seedFirestore';

export function SeedPage() {
  const [status, setStatus] = useState('Ready to seed');
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setStatus('Seeding...');
    
    try {
      await seedFirestore();
      setStatus('✅ Database seeded successfully!');
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Seed Firestore Database</h1>
      <p>{status}</p>
      <button 
        onClick={handleSeed}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Seeding...' : 'Seed Database'}
      </button>
    </div>
  );
}
```

2. Navigate to `/seed` in your app and click the button

## What Gets Seeded?

### Shops (8 total)
- Fresh Produce Market
- Tech Haven
- Fashion Forward
- Home Essentials
- Book Nook
- Sports Central
- Beauty Bliss
- Toy Town

### Products (18 total)
- 2-3 products per shop
- Realistic prices and descriptions
- Proper stock quantities

## Verify the Data

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `kithly-mvp` project
3. Click "Firestore Database" in the left menu
4. You should see two collections:
   - `shops` (8 documents)
   - `products` (18 documents)

## Troubleshooting

**"Permission denied" error:**
- Make sure your Firestore is in **test mode**
- Check your Firestore Rules allow read/write

**Import error:**
- Make sure you're using a modern browser (Chrome, Firefox, Edge)
- Try Option B (Seed Page) instead

**Data already exists:**
- The script will skip seeding if data already exists
- To re-seed, manually delete all documents in Firebase Console first

## Next Steps

Once seeded, your app will:
- ✅ Show real shops from Firestore
- ✅  Load real products per shop
- ✅ Save orders to Firestore
- ✅ Persist data across browser refreshes
- ✅ Work for all users (not just you!)
