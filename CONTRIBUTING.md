# Contributing to IEEE <NAME> SB Platform

## 🤖 Built with Google Antigravity

This project was architected using **Google Antigravity (Agentic IDE)**. While you can edit the code in VS Code or generic editors, it is highly recommended to use an AI-native editor (Antigravity, Cursor, or Windsurf) to maintain the velocity of development.

## 🚀 How to Maintain This Project (For Future ExComs)

The architecture relies heavily on the "Zero-Cost" stack (React + GAS + Firebase). Because logic is split between the frontend and the Google Apps Script backend, debugging can be tricky.

### Recommended Workflow

#### 1. Frontend Changes

The UI is built with **Tailwind 4** and **React 19**.

**Prompting Tip:** "I need to add a new section to the User Profile. Please update the Firestore security rules first, then create the React component."

**Key Files:**

- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/services/` - API and Firebase services
- `src/context/` - React Context providers

#### 2. Backend Changes (The "Invisible" Part)

The backend logic lives in `backend_scripts/Code.gs`.

**⚠️ Crucial:** If you change `Code.gs`, you must:

1. **Redeploy** the Web App in the GAS editor (`Deploy` > `New Deployment`)
2. Copy the new deployment URL
3. Update the URL in Admin Dashboard → Settings → GAS URLs

**Prompting Tip:** "I need to add a function to `Code.gs` that deletes a blog post. Write the GAS function to handle the `delete_blog` action and show me the fetch call for the frontend."

**Common GAS Actions:**

- `register_event` - Event registrations
- `send_email` - Email sending
- `upload_file` - File uploads to Drive
- `list_files` - List files in Drive folders
- `save_blog_content` - Save blog markdown
- Custom event actions (e.g., `register_my_event`)

#### 3. Custom Event Pages

These are HTML snippets injected into an iframe for security.

**Security Warning:**

- Do not allow `<script>` tags that access `parent.window` or cookies
- The system automatically sanitizes this, but be careful when reviewing PRs
- Test all custom events in a sandbox environment first

**Best Practices:**

- Use `URLSearchParams` for form submissions (better CORS compatibility)
- Always validate data on the GAS backend
- Test with different browsers
- Keep custom pages lightweight (< 100KB)

## 🆘 Troubleshooting The "Antigravity" Stack

### Images not loading?

- Check if the Google Drive folder permission is set to "Anyone with the link"
- Verify the `FOLDER_ID` in `Code.gs` matches the actual folder ID
- Ensure files are in the correct Drive folder

### CORS Errors?

- Google Apps Script redirects `fetch` calls
- Ensure your frontend fetch includes `redirect: "follow"`
- For Custom Events, use `URLSearchParams` instead of JSON
- Ensure the GAS script returns `ContentService.createTextOutput()` with proper MIME type

### Build Failures?

- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all environment variables are set in `.env`

### Session Timeout Issues?

- Check `VITE_ADMIN_SESSION_TIMEOUT` in `.env`
- Clear browser cache and localStorage
- Verify Firebase Auth configuration

### Email Features Not Working?

- Verify Gmail API is enabled in GCP
- Check GAS deployment permissions
- Ensure `gas_url_mail` is correctly set in Firestore

## 📝 Making Changes

### Adding a New Feature

1. **Plan First**: Create an implementation plan

   ```text
   "I want to add a feature that allows users to bookmark blog posts. 
   Create an implementation plan including Firestore schema, 
   React components, and any GAS functions needed."
   ```

2. **Update Firestore Rules**: Always update security rules first

   ```text
   "Update the Firestore rules to allow users to read/write their own bookmarks"
   ```

3. **Implement Frontend**: Create components and services

   ```text
   "Create a BookmarkButton component and add it to BlogCard"
   ```

4. **Test**: Verify functionality

   ```text
   "Help me write a test plan for the bookmark feature"
   ```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages (careful!)
npm update
```

### Deploying Changes

#### Firebase Hosting

```bash
npm run build
npm run deploy
```

#### Render (if using)

- Push to GitHub
- Render auto-deploys from main branch

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate Firebase API keys** if exposed
3. **Review Firestore rules** before deploying
4. **Sanitize user input** in custom event pages
5. **Use environment variables** for all sensitive data

## 📚 Resources

- [React 19 Docs](https://react.dev)
- [Tailwind CSS 4 Docs](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [Antigravity Documentation](https://deepmind.google/technologies/antigravity/)

## 🤝 Getting Help

1. **Check the README** - Most common issues are documented
2. **Use AI Assistants** - This project was built with AI, maintain it with AI
3. **Contact Previous Maintainers** - Reach out to Muhammad Abdullah or the ExCom
4. **IEEE <NAME> SB Email** - <sb.ieee@baiust.edu.bd>

## 📊 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 50+
- **Admin Features**: 10+
- **Public Pages**: 8+
- **GAS Functions**: 20+

## 🎯 Development Philosophy

This project follows the **"AI-First Development"** approach:

- Use AI to generate boilerplate code
- Focus on architecture and business logic
- Let AI handle repetitive tasks
- Review and refine AI-generated code
- Document everything for future AI assistants

---

### Legacy Note

This architecture was designed by Muhammad Abdullah (2025-2026). If the Firebase quota is exceeded, upgrade to the Blaze plan or archive old event photos to a separate Drive account.

Built with ❤️ and 🤖 by Muhammad Abdullah with Antigravity.
