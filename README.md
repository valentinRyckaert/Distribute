# Distribute - the "Ticketing-Blog" app

## What is Distribute?

Distribute is a mix between a blog and a ticketing tool: users create posts (tickets) to share their IT problems and how to resolve them.

The main objective is to improve "self-recovery" and relieve IT assistance call centers.

The project is an Expo/React Native app with a Supabase database run with Bun.js.

## How to build the project

```shell
git clone https://github.com/valentinRyckaert/Distribute.git
cd Distribute
```

Create a .env file

```env
EXPO_PUBLIC_SUPABASE_URL=https://supabase/yourdb
EXPO_PUBLIC_SUPABASE_KEY=your_api_key
```

```shell
bun install
bun start
```

## Local Supabase (Docker)

Requires Docker running. The Supabase CLI starts the whole stack (Postgres, Auth, REST, Studio) in containers,
applies `supabase/migrations/` and loads `supabase/seed.sql`.

```shell
bun db:start   # first run pulls the images; prints the URL and keys
bun db:reset   # re-apply migrations + seed
bun db:stop
```

- Studio: http://127.0.0.1:54323
- Emails sent locally (password reset codes): http://127.0.0.1:54324
- Test users (`password123`): `test@distribute.local` (regular), `admin@distribute.local` (admin)
- After changing the schema: `bun db:types` regenerates `src/lib/database.types.ts`

Point the app to it in `.env` (use your machine's LAN IP, not `localhost`, so a phone can reach it):

```env
EXPO_PUBLIC_SUPABASE_URL=http://192.168.x.x:54321
EXPO_PUBLIC_SUPABASE_KEY=<PUBLISHABLE_KEY printed by bun db:start>
```

## Run on your phone with Expo Go

Phone and computer on the same Wi-Fi, then:

```shell
bun go        # expo start --go, scan the QR code with Expo Go (Android) or the Camera app (iOS)
bun go --tunnel  # if the phone can't reach your machine (different network, firewall)
```

## Code conventions

See [docs/CONVENTIONS.md](docs/CONVENTIONS.md). `bun run check` runs Prettier, ESLint and TypeScript.

## Tests

```shell
bun run test:coverage     # unit and component tests, fails under 75 % coverage
bun db:reset && bun run test:integration   # API and security rules against the local Supabase
```

End-to-end tests use [Maestro](https://maestro.dev) on an Android phone or emulator with Expo Go:

```shell
bun db:reset
bun go                                # Metro must be running
adb reverse tcp:8081 tcp:8081         # the phone reaches Metro through USB
bun run test:e2e
```

## Security

- The publishable key ships in the app, so **Row Level Security is the real protection**: every table
  has RLS and explicit policies (`supabase/migrations`), checked by `tests/integration/security.test.ts`.
- Regular users only edit or delete their own reports; author, dates, validation, duplicates and
  counters cannot be forged; notifications are only created by the database.
- The admin role lives in `app_metadata`, which only the server can write.
- Public sign-up is disabled: create accounts in Studio (Authentication › Add user). To make someone
  an admin, run in the SQL editor:
  `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '…';`
- Passwords: 8 characters minimum with letters and digits; password changes require a recent sign-in.
- The session is stored encrypted on the phone (AES-256-GCM, key in the OS keychain).
- Photos go to a private bucket (5 MB images), each user writes only in their own folder.
- Apply the same auth settings to the hosted project (sign-up off, password rules, recovery email
  template with `{{ .Token }}` from `supabase/templates/recovery.html`).

## For better security

As the app needs an API key to contact the database, this one is available **in plain text** in the production code.
Supabase uses **Row Level Security**, which helps to limit access even with the key.

For an internal deployment (Supabase server and the app are used only inside the company), the availability of the Supabase information is not a big security problem.

However, the best practice is to use a backend server, which takes charge of the connection with the React Native app and Supabase.
