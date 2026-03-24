# Bursdag App

Next.js app with Firebase Google authentication.

## Prerequisites

1. A Firebase project
2. Firebase Authentication enabled
3. Node.js 20+

## Environment Variables

Create `.env` in the project root with:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Firebase Console Setup

1. Go to Authentication -> Sign-in method.
2. Enable `Google` provider.
3. Add authorized domains in Authentication -> Settings -> Authorized domains:
   - `localhost`
   - your production domain (for example `your-app.vercel.app`)
4. Confirm the `authDomain` in `.env` matches your Firebase project.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Auth Flow Implemented

1. User opens the app on `/`.
2. User clicks `Logg inn med Google`.
3. App signs in via Firebase `signInWithPopup`.
4. Authenticated user is redirected to `/gjester`.

## Useful Commands

```bash
npm run lint
npm run build
```
