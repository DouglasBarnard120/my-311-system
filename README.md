# My 311 System

A simple, client-side web application for submitting and tracking non-emergency city service requests.

## Features

- **Submit a Request** — Choose a category (pothole, graffiti, broken streetlight, etc.), describe the issue, and provide the address.
- **Unique Reference Number** — Every submission generates a reference ID (e.g. `311-ABC123-XY45`) saved in `localStorage`.
- **View All Requests** — Browse, search, and filter all requests by status or category.
- **Track Status** — Look up any request by its reference number and see a full status timeline.
- **Advance Status** — Move requests through the workflow: Open → In Progress → Resolved → Closed.

## Getting Started

No build step required. Just open `index.html` in any modern browser:

```bash
open index.html
# or serve with any static file server:
npx serve .
```

## File Structure

```
index.html   # Main HTML shell with all views
style.css    # All styling (responsive, CSS variables)
app.js       # Client-side logic (no dependencies)
```

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no frameworks, no build tools)
- `localStorage` for persistence

> **For genuine emergencies, always call 911.**
