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

power-pages-site/         # Power Pages (pac CLI) deployment package
├── website.yml           # Site metadata
├── page-templates/       # Page template configuration
├── web-templates/        # Liquid HTML templates (header/footer layout)
├── web-files/            # Static assets (CSS, JS) with pac metadata
└── web-pages/            # One subfolder per page (YAML + copy HTML)
    ├── Home/
    ├── Submit-Request/
    ├── Track-Request/
    ├── My-Requests/
    └── Help-and-FAQ/

.github/
└── workflows/
    ├── deploy-pages.yml        # GitHub Actions → GitHub Pages CD pipeline
    └── deploy-power-pages.yml  # GitHub Actions → Power Pages CD pipeline
```

## Deploying to GitHub Pages (static hosting alternative)

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

## Deploying to Power Pages (Power Apps)

The `Deploy 311 Portal to Power Pages` workflow uses the Power Platform CLI (`pac`) to upload the
`power-pages-site/` content to the Dataverse environment at
`https://org74e4d1d8.crm.dynamics.com/`.

### Prerequisites

1. **Create a Power Pages site** in your environment first.
   Go to [Power Pages](https://make.powerpages.microsoft.com/), select your environment
   (`org74e4d1d8`), and create a blank site named **City 311 Citizen Services Portal**.
   This site must exist in Dataverse before the workflow can upload content to it.

2. **Register an Azure AD application** (service principal) with the **Dynamics CRM** permission
   (`user_impersonation`) and grant it the **System Administrator** role in your Power Platform
   environment.

3. **Add three secrets** to this GitHub repository
   (`Settings → Secrets and variables → Actions → New repository secret`):

   | Secret name        | Value                                          |
   |--------------------|------------------------------------------------|
   | `PP_APP_ID`        | Application (client) ID of the service principal |
   | `PP_CLIENT_SECRET` | Client secret generated for that application   |
   | `PP_TENANT_ID`     | Directory (tenant) ID of your Azure AD         |

### Automatic deployment

Push a commit that changes any file under `site/` or `power-pages-site/` to the `main` branch.
The `Deploy 311 Portal to Power Pages` workflow runs automatically.

### Manual trigger

Navigate to **Actions → Deploy 311 Portal to Power Pages → Run workflow** and click **Run**.

### Page URLs after deployment

| Page             | Power Pages URL         |
|------------------|-------------------------|
| Home             | `/`                     |
| Submit a Request | `/submit-request`       |
| Track Request    | `/track-request`        |
| My Requests      | `/my-requests`          |
| Help & FAQ       | `/help`                 |

---

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