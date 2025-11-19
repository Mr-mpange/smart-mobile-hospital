# Deployment Guide

## Prerequisites

- Node.js 16+ installed
- MySQL 8+ installed and running
- Africa's Talking account with API credentials
- Zenopay merchant account
- Domain name (for production)

## Local Development Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
- Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Africa's Talking API key and username
- Zenopay API credentials
- JWT secret key

### 3. Setup Database

```bash
# Create database and tables
npm run db:setup
```

This will:
- Create the database
- Run all migrations
- Insert sample doctors

### 4. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start separately:
# Backend only
npm start

# Frontend only (in another terminal)
cd frontend && npm start
```

Backend runs on: http://localhost:5000
Frontend runs on: http://localhost:3000

## Production Deployment

### Option 1: Traditional Server (Ubuntu/Debian)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd smarthealth

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Build frontend
cd frontend && npm run build && cd ..

# Setup environment
cp .env.example .env
nano .env  # Configure production values

# Setup database
npm run db:setup

# Start with PM2
pm2 start backend/server.js --name smarthealth-api
pm2 save
pm2 startup
```

#### 3. Configure Nginx

```nginx
# /etc/nginx/sites-available/smarthealth

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/smarthealth/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smarthealth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY backend ./backend
COPY database ./database

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create smarthealth-api

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
# ... set other variables

# Deploy
git push heroku main

# Run database setup
heroku run npm run db:setup
```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Build Command: `npm install && cd frontend && npm install && npm run build`
   - Run Command: `npm start`
3. Add MySQL database component
4. Set environment variables
5. Deploy

#### AWS (EC2 + RDS)

1. Launch EC2 instance (Ubuntu 22.04)
2. Create RDS MySQL instance
3. Configure security groups
4. Follow "Traditional Server" steps above
5. Use RDS endpoint as DB_HOST

## Post-Deployment

### 1. Configure Webhooks

Set up webhooks in Africa's Talking dashboard:
- USSD Callback URL: `https://your-domain.com/api/ussd`
- SMS Callback URL: `https://your-domain.com/api/sms/incoming`

### 2. Configure Zenopay

Set up callback URL in Zenopay dashboard:
- Payment Callback: `https://your-domain.com/api/payments/callback`

### 3. Monitor Application

```bash
# View PM2 logs
pm2 logs smarthealth-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart smarthealth-api
```

### 4. Setup Backups

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p smarthealth > backup_$DATE.sql
```

### 5. Enable Monitoring

- Setup application monitoring (e.g., New Relic, DataDog)
- Configure error tracking (e.g., Sentry)
- Setup uptime monitoring (e.g., UptimeRobot)

## Troubleshooting

### Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SHOW DATABASES;"
```

### Application Not Starting

```bash
# Check logs
pm2 logs smarthealth-api

# Check port availability
sudo netstat -tulpn | grep 5000
```

### USSD/SMS Not Working

1. Verify webhook URLs are publicly accessible
2. Check Africa's Talking dashboard for errors
3. Test webhooks with curl:

```bash
curl -X POST https://your-domain.com/api/ussd \
  -d "sessionId=test123&serviceCode=*123#&phoneNumber=+254712345678&text="
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] Input validation in place

## Performance Optimization

1. Enable Nginx caching
2. Use CDN for static assets
3. Optimize database queries
4. Enable gzip compression
5. Setup Redis for session management
6. Monitor and optimize slow queries

## Scaling

### Horizontal Scaling

1. Setup load balancer (Nginx/HAProxy)
2. Deploy multiple backend instances
3. Use shared session store (Redis)
4. Setup database replication

### Vertical Scaling

1. Increase server resources
2. Optimize database configuration
3. Enable query caching
4. Use connection pooling
