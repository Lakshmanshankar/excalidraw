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

Creating policies for supabase buckets is little tricker. you can learn some basics right [here](https://supabase.com/docs/guides/storage/buckets/fundamentals)

For all storage related operations we are using supabase signed urls. except for the remove file operation.
