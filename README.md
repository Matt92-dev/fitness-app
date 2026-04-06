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

Create a production build:

```bash
npm run build
```

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
- Progress is stored in local storage in the browser.
- If you later want data sync across devices, Supabase would be a strong next step.
- This is line is to trigger a test deployment
