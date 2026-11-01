# Ayush Jain | Personal Portfolio

A full-stack personal website showcasing my background, technical skills, and projects as a Computer Science student at the University of Maryland. Built with a React frontend and a Python/FastAPI backend. The site is designed with homage to my hometown, Seattle.

[Visit Website](https://ayush-jain-devportfolio.vercel.app/) · [LinkedIn](https://linkedin.com/in/ayushj8) · [GitHub](https://github.com/ayushj15234)

## Features

- **Project showcase:** Project cards support technology tags, external links, expandable details, and category filters when multiple categories are available.
- **Contact API:** A FastAPI endpoint validates messages with Pydantic, sends them through Resend, and blocks spam with a hidden honeypot field and IP-based rate limiting.
- **Interactive navigation:** Scroll-aware section highlighting, animated section reveals, and a collapsible navigation menu.
- **Accessible interactions:** Skip navigation, descriptive labels, and keyboard-friendly controls.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Python, FastAPI, Pydantic |
| Email | Resend |
| Development | Vite, ESLint, uv |
| Backend testing | pytest, FastAPI TestClient, unittest.mock |

## How It Works

The repository has two apps: the React site in `frontend/` and the FastAPI API in `backend/`. The site renders its skills and projects itself and does not call the API yet. The API's contact endpoint validates a message with Pydantic, emails it through Resend and keeps a copy in memory. The Resend API key stays on the server.

The API keeps its data (skills, projects and received messages) in in-memory Python lists in `backend/main.py`; there is no database, so anything other than the hardcoded sample data is lost when the server restarts.

## Run Locally

### Prerequisites

- A Node.js version compatible with the Vite version in `package.json`, plus npm
- [uv](https://docs.astral.sh/uv/), which installs the right Python version for you
- A Resend API key for contact form email delivery

### 1. Clone the repository

```bash
git clone https://github.com/ayushj15234/PersonalPortfolio.git
cd PersonalPortfolio
```

### 2. Start the backend

Create `backend/.env` using `backend/.env.example` as a starting point:

```dotenv
RESEND_API_KEY=your_resend_api_key
CONTACT_TO=your_email@example.com
CONTACT_FROM=Portfolio <onboarding@resend.dev>
ALLOWED_ORIGINS=http://localhost:5173
```

Use a sender and recipient permitted by your Resend account. For production email delivery, configure an appropriate verified sender. Never commit `.env` or API keys.

Start the API from the `backend` directory (uv installs dependencies on first run):

```bash
cd backend
uv run fastapi dev
```

The backend runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Start the frontend

Open a second terminal in the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

The frontend does not need the backend to run. Without a configured Resend key, the contact endpoint returns a service-unavailable response.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API availability |
| GET | `/api/skills` | Retrieve technical skills by category |
| GET | `/api/projects?category=` | Retrieve projects, optionally filtered by category |
| GET | `/api/projects/{project_id}` | Retrieve one project; `404` if the id doesn't exist |
| POST | `/api/contact` | Validate a contact submission, email it and save it; `201` with the message id |

Invalid input returns `422` with the failing fields. The contact endpoint also returns `429` when rate limited, `503` without a Resend key, and `502` if the email can't be sent.

Example contact request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hi Ayush, I would like to connect about a project.",
  "website": ""
}
```

The `website` field is a honeypot and should remain empty for legitimate submissions. Contact requests are limited to five attempts per IP address per hour. Rate-limit state is stored in process memory and resets when the server restarts.

## Development Commands

From `frontend`:

```bash
npm run dev      # Start the frontend development server
npm run build    # Build the frontend for production
npm run preview  # Preview the frontend production build locally
npm run lint     # Run ESLint
```

### Backend tests

From `backend`:

```bash
uv run pytest -q
```

The test suite covers skills and project responses, project lookup and filtering, invalid contact input, mocked email delivery, honeypot handling, rate limiting, and missing email configuration. Email delivery is mocked rather than sent through Resend during tests.

## Customization

- **Skills:** Update `skills` in `frontend/src/App.jsx`.
- **Projects:** Add or edit entries in `frontend/src/data/projects.js`.
- **Profile and navigation:** Edit `frontend/src/App.jsx`.
- **Styling:** Update `frontend/src/App.css` and `frontend/src/index.css`.
- **Project images:** Place images in `frontend/public/projects/` and reference them using paths such as `/projects/my-project.png`.

Project entries support `id`, `title`, `description`, `category`, `tags`, `image`, `liveUrl`, `githubUrl`, and `details`. Category filter controls appear when projects span at least two categories.

## Deployment Configuration

Deploy the frontend and backend separately. The frontend deploys to Netlify using `netlify.toml`, which builds from `frontend/`. Add any frontend origin that calls the API to the backend's comma-separated `ALLOWED_ORIGINS` setting.

Keep `RESEND_API_KEY`, `CONTACT_TO`, and `CONTACT_FROM` in the backend environment. The current in-memory rate limiter is intended for a single server process; a multi-instance deployment needs shared rate-limit storage.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
