# City 311 Citizen Services Portal

A modern, accessible, static-web portal that lets citizens report non-emergency service requests, track their status, and browse help articles — all without any server-side dependencies.

## Features

- **Submit a Request** – categorised form with geolocation, photo upload, and client-side validation
- **Track a Request** – look up any reference number (SR-XXXXX) for real-time status progress
- **My Requests** – browser-session dashboard of submitted requests
- **Knowledge Base & FAQ** – searchable help articles and accordion FAQ
- **Responsive & Accessible** – mobile-first layout, skip-link, ARIA roles, keyboard navigation

## Repository Layout

```
site/
├── index.html            # Home page
├── submit-request.html   # Service request form
├── track-request.html    # Status tracker
├── my-requests.html      # Submitted-requests dashboard
├── knowledge-base.html   # Help articles and FAQ
├── css/
│   └── style.css         # Complete design system
└── js/
    └── app.js            # Application logic (vanilla JS)

.github/
└── workflows/
    └── deploy-pages.yml  # GitHub Actions → GitHub Pages CD pipeline
```

## Deploying to GitHub Pages

### Automatic deployment (recommended)

1. In your repository, go to **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Push a commit that changes any file under `site/` to the `main` branch.
   The `Deploy 311 Portal to GitHub Pages` workflow runs automatically and publishes the site.
4. The live URL is shown in the workflow run output and on the Pages settings page
   (typically `https://<owner>.github.io/<repo>/`).

### Manual trigger

Navigate to **Actions → Deploy 311 Portal to GitHub Pages → Run workflow** and click **Run**.

### Required permissions

The workflow uses the built-in `GITHUB_TOKEN` with the following permissions (set in the workflow file):

| Permission | Level |
|------------|-------|
| `contents` | `read` |
| `pages`    | `write` |
| `id-token` | `write` |

No additional secrets or tokens are required.

## Local development

Open any HTML file directly in a browser, or serve the `site/` directory with any static file server:

```bash
# Python
python -m http.server 8080 --directory site

# Node.js (npx)
npx serve site
```

Then visit `http://localhost:8080`.

## Connecting to a real backend

The portal is designed as a pure front-end shell. To wire it up to Power Platform / Dataverse or any REST API:

1. Replace the `setTimeout` simulation in `site/js/app.js` → `initSubmitForm()` with a `fetch()` call to your API endpoint.
2. Replace the demo data in `initTracker()` with a real API lookup keyed by reference number.
3. Add authentication (e.g., Azure AD B2C) as needed by wrapping the form submission logic.

## Accessibility

The portal targets WCAG 2.1 AA:

- Semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Skip navigation link
- `aria-label` / `aria-expanded` / `aria-controls` on interactive elements
- Keyboard-navigable service cards (role=button, tabindex, Enter/Space handlers)
- `aria-live` polite region for toast notifications
- Sufficient colour contrast ratios throughout

## License

This project is provided as-is for demonstration and civic-tech purposes.