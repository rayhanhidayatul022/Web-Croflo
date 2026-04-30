# Web Croflo — React + Vite + Firebase starter

Minimal starter scaffold using React, Vite, TypeScript and Firebase (Auth + Firestore).

Quick start

1. Copy environment variables from `.env.example` to `.env` and fill Firebase values.
2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

Files of interest

- [src/services/firebase.ts](src/services/firebase.ts) : initialize Firebase using `VITE_` env vars.
- [firestore.rules](firestore.rules) : basic Firestore security rules.

Next steps

- Set up Firebase project and enable Authentication (Email/Password).
- Deploy Firestore rules and add hosting if needed.
