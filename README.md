# Fitness App

This project is now structured as a small React app powered by Vite.

## Local development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Start the local API server in a second terminal:

```bash
npm run dev:api
```

Create a production build:

```bash
npm run build
```

Run the production server after building:

```bash
npm start
```

The API stores workout logs in `data/fitness.sqlite`. The `data` folder is ignored by Git so local or VPS workout data is not committed.

## VPS deployment

The production deployment templates are in `deploy/`. See `deploy/README.md` for the Ubuntu/Debian setup, systemd service, Caddy HTTPS proxy, and private-access configuration.

## Recommended GitHub workflow

Initialize Git in this folder if you have not already:

```bash
git init
git branch -M main
git add .
git commit -m "Initial React version"
```

Create a GitHub repository, then connect it:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

After that, your normal workflow becomes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

## Deployment

The project includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

Once the repository is on GitHub:

1. Open the repository settings.
2. Go to `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main`.

Each push to `main` will build the app and deploy it automatically.

## Notes

- The Vite config uses a relative base path, which keeps deployment simple on GitHub Pages.
- Progress still falls back to local storage in the browser if the API is unavailable.
- The local API stores workout logs in SQLite as the first step toward VPS-backed sync.
- This is line is to trigger a test deployment
