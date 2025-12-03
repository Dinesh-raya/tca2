# TCA Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- MongoDB instance (or use the one in docker-compose)
- Node.js 18+ (for local dev)

## Environment Variables
Create a `.env` file in the `backend` directory for local dev, or set these in your deployment platform.

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | Connection string | `mongodb://localhost:27017/tca_db` |
| `JWT_SECRET` | Secret for tokens | **MUST CHANGE IN PROD** |
| `FRONTEND_URL` | URL of frontend | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

## Docker Deployment (Recommended)

1.  **Build and Start**:
    ```bash
    docker-compose up -d --build
    ```
    This will start:
    - MongoDB (port 27017)
    - Backend (port 5000)
    - Frontend (port 80, served via Nginx)

2.  **Check Status**:
    ```bash
    docker-compose ps
    ```

3.  **View Logs**:
    ```bash
    docker-compose logs -f
    ```

4.  **Stop**:
    ```bash
    docker-compose down
    ```

## Manual Deployment

### Backend
1.  `cd backend`
2.  `npm install --production`
3.  `export NODE_ENV=production`
4.  `node server.js`

### Frontend
1.  `cd frontend`
2.  `npm install`
3.  `npm run build`
4.  Serve the `build` folder using a static server (e.g., `serve -s build`, Nginx, Apache).

## Database Backups
Run the backup script manually or set up a cron job:
```bash
./scripts/backup.sh
```
Backups are saved to `./backups`.

## Security Checklist
- [ ] Change `JWT_SECRET` to a long, random string.
- [ ] Set `NODE_ENV=production`.
- [ ] Ensure MongoDB authentication is enabled (default in docker-compose).
- [ ] Use HTTPS (SSL/TLS) in front of Nginx/Backend (e.g., using a reverse proxy like Traefik or Cloudflare).
