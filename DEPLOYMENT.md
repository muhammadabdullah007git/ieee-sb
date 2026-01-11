# Deployment Guide

This guide covers how to deploy the IEEE BAUST SB website to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your system
- Project pushed to a GitHub repository

## Deployment Methods

### Method 1: Automatic Deployment with GitHub Actions (Recommended)

This method automatically deploys your site whenever you push to the main branch.

#### Setup Steps

1. **Enable GitHub Pages in your repository:**
   - Go to your GitHub repository
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Push your code:**

   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the deployment workflow run
   - Once complete, your site will be live at: `https://yourusername.github.io/ieee-baust-sb/`

#### How it works

- The workflow file `.github/workflows/deploy.yml` automatically triggers on every push to main
- It builds the project using `npm run build`
- Deploys the `dist` folder to GitHub Pages

---

### Method 2: Manual Deployment with gh-pages

This method allows you to manually deploy whenever you want.

#### Setup Steps

1. **Install gh-pages package:**

   ```bash
   npm install --save-dev gh-pages
   ```

2. **Deploy manually:**

   ```bash
   npm run deploy:gh
   ```

3. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Click on **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Select the **gh-pages** branch
   - Click **Save**

4. **Access your site:**
   - Your site will be available at: `https://yourusername.github.io/ieee-baust-sb/`

---

## Important Configuration

### Base Path

The `vite.config.js` file includes a `base` configuration:

```javascript
base: '/ieee-baust-sb/'
```

**Important:** Replace `ieee-baust-sb` with your actual GitHub repository name.

If deploying to a custom domain or the root of your GitHub Pages (e.g., `username.github.io`), set:

```javascript
base: '/'
```

---

## Troubleshooting

### Issue: 404 errors on page refresh

**Solution:** The build script already creates a `404.html` file that redirects to `index.html` for client-side routing.

### Issue: Assets not loading

**Solution:** Ensure the `base` path in `vite.config.js` matches your repository name exactly.

### Issue: GitHub Actions workflow fails

**Solution:**

- Check that GitHub Pages is enabled in repository settings
- Verify the workflow has proper permissions (already configured in the workflow file)
- Check the Actions tab for detailed error logs

### Issue: Old version still showing

**Solution:**

- Clear your browser cache
- Wait a few minutes for GitHub's CDN to update
- Check the Actions tab to ensure deployment completed successfully

---

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` folder with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

---

## Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are properly configured
- [ ] Firebase configuration is set up
- [ ] The `base` path in `vite.config.js` is correct
- [ ] All tests pass
- [ ] Build completes without errors: `npm run build`
- [ ] Preview works locally: `npm run preview`

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [gh-pages Package](https://www.npmjs.com/package/gh-pages)
