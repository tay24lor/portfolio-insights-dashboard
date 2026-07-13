# Portfolio Insights Dashboard

A full-stack portfolio analytics dashboard with an Angular frontend and an Express/TypeScript backend. The application provides authenticated access to holdings, portfolio summary data, and a user login flow.

## Repository structure

- `frontend/` — Angular 19 application with Material UI and client-side routing
- `backend/` — Express API server with TypeScript, JWT authentication, and mock data

## Prerequisites

- Node.js 18 or later
- npm 10 or later

## Local setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

The backend runs by default on `http://localhost:8080`.

### 3. Start the frontend

```bash
cd frontend
npm start
```

The frontend runs by default on `http://localhost:4200`.

## Authentication

The frontend uses JWT authentication for protected API requests. A valid token is stored in browser local storage after login.

### Default mock credentials

- Email: `test@example.com`
- Password: `password`

## Available commands

### Backend

From `backend/`:

- `npm run dev` — start the backend in development mode with hot reload
- `npm run build` — compile the backend TypeScript to `dist/`
- `npm start` — run the built backend from `dist/`

### Frontend

From `frontend/`:

- `npm start` — launch the Angular development server
- `npm run build` — build the frontend for production
- `npm test` — run unit tests
- `npm run watch` — build continuously in development mode
- `npm run serve:ssr:frontend` — run SSR backend bundle after building

## API endpoints

### Auth

- `POST /api/auth/login` — authenticate user and receive a JWT
- `POST /api/auth/register` — register a new user (development only)

### Portfolio

- `GET /api/portfolio/summary` — fetch portfolio summary
- `GET /api/holdings` — fetch authenticated user's holdings

## Notes

- The backend currently uses mock data in `backend/src/mock/`
- The frontend injects an authorization header using the stored JWT on each request
- The layout includes a logout button in the top-right toolbar to return to the login screen

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request with tests and documentation updates

## License

This repository does not include a license file. Add one if you want to publish or share this project publicly.
