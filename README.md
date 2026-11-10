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
- Test user: `test@distribute.local` / `password123`

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

## For better security

As the app needs an API key to contact the database, this one is available **in plain text** in the production code.
Supabase uses **Row Level Security**, which helps to limit access even with the key.

For an internal deployment (Supabase server and the app are used only inside the company), the availability of the Supabase information is not a big security problem.

However, the best practice is to use a backend server, which takes charge of the connection with the React Native app and Supabase.
