<a href="https://excalidraw.com/" target="_blank" rel="noopener">
  <picture>
    <source media="(prefers-color-scheme: dark)" alt="Excalidraw" srcset="https://excalidraw.nyc3.cdn.digitaloceanspaces.com/github/excalidraw_github_cover_2_dark.png" />
    <img alt="Excalidraw" src="https://excalidraw.nyc3.cdn.digitaloceanspaces.com/github/excalidraw_github_cover_2.png" />
  </picture>
</a>

<h4 align="center">
  <a href="https://excalidraw.com">Excalidraw Editor</a> |
  <a href="https://plus.excalidraw.com/blog">Blog</a> |
  <a href="https://docs.excalidraw.com">Documentation</a> |
  <a href="https://plus.excalidraw.com">Excalidraw+</a>
</h4>

## Disclaimer

<blockquote>
 This project is built for learning and demonstration purposes only. It is not intended to compete with Excalidraw in any way. If you need a reliable, hosted solution with cloud sync, please support Excalidraw.
</blockquote>


## About this project 

This is my custom excalidraw app that uses supabase storage to store the files.
I've published a detailed blog post about it [here](https://lakshmanshankar.github.io/projects/excalidraw-with-custom-backend/).


## Features I added:

1. Authentication using google
2. Upload and save files to cloud storage.
3. File tree for organizing files
4. Move and update files


## How to run the app

1. Clone the repo

```sh
git clone git@github.com:Lakshmanshankar/excalidraw.git
```

2. Install dependencies 

```sh
cd backend
pnpm install
```

```sh
cd ..
yarn
```

3. Create a `.env` file in the root directory and add the following variables

```sh
AUTH_GOOGLE_ID=xxxx
AUTH_GOOGLE_SECRET=xxxx

AUTH_SECRET=xxxx

SUPABASE_URL=https://{your-project-id}.supabase.co
SUPABASE_ANON_KEY=your-anon-key

DATABASE_URL_POOLED=posgres_url # (you can get it in supabase dashboard)
```

4. Run the app

```sh
cd backend && pnpm dev
```

```sh
yarn start
```
