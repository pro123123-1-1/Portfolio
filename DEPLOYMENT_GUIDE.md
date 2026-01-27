# Deployment Guide for Render

This guide walks you through deploying your **Dairy Direct** project (Django Backend + React Frontend) to [Render.com](https://render.com).

## Prerequisites
1.  **Push to GitHub**: Ensure all your latest changes (including `build.sh` and settings updates) are pushed to your GitHub repository.

---

## Part 1: Deploying the Database (PostgreSQL)
1.  Log in to your Render Dashboard.
2.  Click **New +** and select **PostgreSQL**.
3.  **Name**: `dairy-db` (or anything you like).
4.  **Region**: Choose the closest one (e.g., Frankfurt or Singapore).
5.  **Plan**: Select **Free**.
6.  Click **Create Database**.
7.  *Wait/Note*: Once created, copy the **Internal Database URL** (it starts with `postgres://...`). You might need this later, though Render often auto-links it.

---

## Part 2: Deploying the Backend (Django)
1.  Click **New +** and select **Web Service**.
2.  Connect your GitHub repository (`Portfolio`).
3.  **Name**: `dairy-backend`.
4.  **Region**: Same as your database.
5.  **Root Directory**: `backend` (Important!).
6.  **Runtime**: Python 3.
7.  **Build Command**: `./build.sh`
8.  **Start Command**: `gunicorn dairy_direct.wsgi`
9.  **Plan**: Free.
10. **Environment Variables**:
    *   Scroll down to "Environment Variables" and add:
    *   `PYTHON_VERSION`: `3.9.0` (or your local version, e.g. `3.11.0`)
    *   `SECRET_KEY`: (Generate a random string or copy from your local `.env`)
    *   `DEBUG`: `False`
    *   `ALLOWED_HOSTS`: `*`
    *   `DATABASE_URL`: (Paste the **Internal Database URL** from Part 1. *Note: If you link the database in the dashboard, this might be set automatically.*)
11. Click **Create Web Service**.
12. *Wait*: It will build and deploy. Once finished, copy the **URL** (e.g., `https://dairy-backend.onrender.com`).

---

## Part 3: Deploying the Frontend (React)
1.  Click **New +** and select **Static Site**.
2.  Connect the same GitHub repository.
3.  **Name**: `dairy-frontend`.
4.  **Root Directory**: `frontend-react` (Important!).
5.  **Build Command**: `npm run build`
6.  **Publish Directory**: `dist`
7.  **Environment Variables**:
    *   Add a new variable:
    *   **Key**: `VITE_API_BASE_URL`
    *   **Value**: Paste your **Backend URL** from Part 2 (e.g., `https://dairy-backend.onrender.com`). **Do not add a trailing slash `/`**.
8.  Click **Create Static Site**.
9.  *Wait*: It will build. Once done, visit your new website URL!

---

## Troubleshooting
*   **Database connection failed?** Check that `DATABASE_URL` is correct in the Backend Environment Variables.
*   **Static files missing?** Ensure the Backend Build Command is exactly `./build.sh` and that file exists in your repo.
*   **API errors on Frontend?** Check the Console (F12). If requests generate 404s, verify `VITE_API_BASE_URL` is set correctly in the Frontend service.
