# Web Croflo — React + Vite + Firebase starter

Minimal starter scaffold using React, Vite, TypeScript and Firebase (Auth + Firestore).

Quick start

1. Copy environment variables from `.env.example` to `.env.local`.
2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

Firebase integration (complete checklist)

1. Web SDK configuration
	- Firebase config is centralized in `src/services/firebase.ts`.
	- Exports available: `app`, `auth`, `db`, `googleProvider`.

2. Enable Google Sign-In in Firebase Console
	- Go to Authentication -> Sign-in method.
	- Enable `Google` provider.
	- Add authorized domain: `localhost`.

3. Firestore rules and indexes
	- Rules file: `firestore.rules`.
	- Index file: `firestore.indexes.json`.
	- Deploy both with:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

4. Seed initial places data
	- Open `scripts/places.seed.json`.
	- Create collection `places` in Firestore Console.
	- Add documents using IDs in that file (`jabarano`, `bagi-kopi`, `jabarano-dago`).
	- Required fields: `name` (string), `address` (string), `rating` (number), `seats` (map with `available`, `capacity`).

5. Run local emulator (optional, recommended for dev)

```bash
npm run emulators
```

	- If using emulator in app, set in `.env.local`:

```env
VITE_USE_FIREBASE_EMULATOR=true
```

Files of interest

- [src/services/firebase.ts](src/services/firebase.ts) : initialize Firebase using `VITE_` env vars.
- [firestore.rules](firestore.rules) : basic Firestore security rules.
- [firebase.json](firebase.json) : local emulator and firestore config.
- [scripts/places.seed.json](scripts/places.seed.json) : sample data for `places` collection.

Next steps

- Enable Google provider + authorized domains in Firebase Console.
- Seed `places` collection and verify `/place/jabarano` in app.
