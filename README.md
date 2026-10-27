# Ayush Jain | Personal Portfolio

A full-stack personal website showcasing my background, technical skills, and projects as a Computer Science student at the University of Maryland. Built with a React frontend and a Python/FastAPI backend, the site combines a Seattle-inspired design with API-driven content and an integrated contact form.

[Visit Website](https://ayush-jain-devportfolio.vercel.app/) · [LinkedIn](https://linkedin.com/in/ayushj8) · [GitHub](https://github.com/ayushj15234)

## Features

- **API-driven content:** Skills and projects are fetched from the FastAPI backend.
- **Project showcase:** Project cards support technology tags, external links, expandable details, and category filters when multiple categories are available.
- **Contact form:** Visitor messages are sent through Resend, with Pydantic validation, a hidden honeypot field, and IP-based rate limiting.
- **Interactive navigation:** Scroll-aware section highlighting, animated section reveals, and a collapsible navigation menu.
- **Accessible interactions:** Skip navigation, descriptive labels, form error messages, and loading and retry states.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Python, FastAPI, Pydantic |
| Email | Resend |
| Development | Vite, ESLint, Uvicorn |
| Backend testing | pytest, FastAPI TestClient, unittest.mock |

## How It Works

The React frontend requests skill and project data from the backend and renders it as reusable components. Contact submissions are validated by FastAPI and Pydantic before the backend calls Resend to deliver an email. The Resend API key stays on the server.

Skills and project content currently live in Python lists in `backend/main.py`; the application does not use a database.

## Run Locally

### Prerequisites

- A Node.js version compatible with the Vite version in `package.json`, plus npm
- Python 3.10 or later
- A Resend API key for contact form email delivery

### 1. Clone the repository

```bash
git clone https://github.com/ayushj15234/PersonalPortfolio.git
cd PersonalPortfolio
```

### 2. Start the backend

Open a terminal in the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create `backend/.env` using `backend/.env.example` as a starting point:

```dotenv
RESEND_API_KEY=your_resend_api_key
CONTACT_TO=your_email@example.com
CONTACT_FROM=Portfolio <onboarding@resend.dev>
ALLOWED_ORIGINS=http://localhost:5173
```

Use a sender and recipient permitted by your Resend account. For production email delivery, configure an appropriate verified sender. Never commit `.env` or API keys.

Start the API from the `backend` directory:

```bash
python -m uvicorn main:app --reload
```

The backend runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Start the frontend

Open a second terminal in the repository root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

The frontend defaults to `http://127.0.0.1:8000` for API requests. To use a different backend, create `.env.local` in the repository root:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Restart Vite after changing environment variables. Both servers must be running for API-powered features to work. Without a configured Resend key, the contact endpoint returns a service-unavailable response.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API availability |
| GET | `/api/skills` | Retrieve technical skills by category |
| GET | `/api/projects` | Retrieve portfolio projects |
| POST | `/api/contact` | Validate a contact submission and send an email |

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

From the repository root:

```bash
npm run dev      # Start the frontend development server
npm run build    # Build the frontend for production
npm run preview  # Preview the frontend production build locally
npm run lint     # Run ESLint
```

### Backend tests

With your virtual environment active, run from `backend`:

```bash
python -m pip install pytest httpx
python -m pytest -q
```

The test suite covers skills and project responses, invalid contact input, mocked email delivery, honeypot handling, rate limiting, and missing email configuration. Email delivery is mocked rather than sent through Resend during tests.

## Customization

- **Skills:** Update `SKILLS` in `backend/main.py`.
- **Projects:** Add or edit entries in `PROJECTS` in `backend/main.py`.
- **Profile and navigation:** Edit `src/App.jsx`.
- **Styling:** Update `src/App.css` and `src/index.css`.
- **Project images:** Place images in `public/projects/` and reference them using paths such as `/projects/my-project.png`.

Project entries support `id`, `title`, `description`, `category`, `tags`, `image`, `liveUrl`, `githubUrl`, and `details`. Category filter controls appear when projects span at least two categories.

## Deployment Configuration

Deploy the frontend and backend separately. Set `VITE_API_URL` to the deployed backend URL before building the frontend, and add the deployed frontend origin to the backend's comma-separated `ALLOWED_ORIGINS` setting.

Keep `RESEND_API_KEY`, `CONTACT_TO`, and `CONTACT_FROM` in the backend environment. The current in-memory rate limiter is intended for a single server process; a multi-instance deployment needs shared rate-limit storage.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
