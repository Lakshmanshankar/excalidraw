# Supabase setup

This project uses supabase postgres database and supabase file storage. Here I have left some instructions to help you setup your supabase account to run this application.

Though i didn't used supabase auth, yes it simplifies things around policies but i want a solution that works without vendor lockin so i have choosen auth.js

# Database
You just have to create a supabase account and then create a database and add that  postgress URI to .env refer `.env.sample` for variable names.

Run all migrations

```sh
pnpm drizzle:migrate
```

# Storage

This part is a little tricker because you have to create appropriate policies for supabase buckets.
[basics](https://supabase.com/docs/guides/storage/buckets/fundamentals)

You then create a private bucket and add the following policies so that a user can write


# Policies

1. The main idea is to keep every file private so that only a authenticated user can have access to that file. which require sending every response through our express as we have authentication right here.

