# Deployment Guide - Indonesia Map Application

## Overview
This project uses GitHub Actions for CI/CD with two workflows:

1. **PR Build Check** (`.github/workflows/maven-build.yml`) - Runs on pull requests
2. **Build, Docker, and Deploy** (`.github/workflows/maven.yml`) - Runs on push to main

## Architecture

```
GitHub Push → Build Maven → Build Docker → Push to Docker Hub → Deploy to Dev Server
```

## Required GitHub Secrets

### Docker Hub Secrets
- `DOCKER_TOKEN` - Docker Hub Personal Access Token

### Database Secrets
- `DB_USERNAME` - Database username (e.g., yu71)
- `DB_PASSWORD` - Database password (e.g., 53cret)

### SSH Deployment Secrets
- `SSH_PRIVATE_KEY` - SSH private key for deployer@103.31.204.189

## Setup Instructions

### 1. Create Docker Hub Token

1. Go to https://hub.docker.com/settings/security
2. Click **"New Access Token"**
3. Name: `github-actions-indonesia-map`
4. Permissions: **Read, Write, Delete**
5. Copy the token (you won't see it again!)

### 2. Generate SSH Key for Deployment

On your local machine:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/indonesia-map-deploy

# Copy public key to deployment server
ssh-copy-id -i ~/.ssh/indonesia-map-deploy.pub deployer@103.31.204.189

# Test SSH connection
ssh -i ~/.ssh/indonesia-map-deploy deployer@103.31.204.189

# Display private key (to add as GitHub secret)
cat ~/.ssh/indonesia-map-deploy
```

### 3. Prepare Deployment Server

SSH into your server and set up the environment:

```bash
# SSH to server
ssh deployer@103.31.204.189

# Create deployment directory
mkdir -p /home/deployer/maps
cd /home/deployer/maps

# Install Docker (if not already installed)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Add deployer user to docker group
sudo usermod -aG docker deployer

# Logout and login again for group changes to take effect
exit
ssh deployer@103.31.204.189

# Verify Docker works without sudo
docker ps

# Set up MySQL database (if not already running)
docker run -d \
  --name mysql-indonesia-map \
  --restart unless-stopped \
  -p 13306:3306 \
  -e MYSQL_ROOT_PASSWORD=53cret \
  -e MYSQL_DATABASE=wilayah_indo3 \
  -e MYSQL_USER=yu71 \
  -e MYSQL_PASSWORD=53cret \
  -v mysql_data:/var/lib/mysql \
  mysql:9.5.0

# Verify MySQL is running
docker ps | grep mysql
```

### 4. Add Secrets to GitHub

#### Using GitHub CLI (Recommended)

```bash
cd /Users/hendisantika/IdeaProjects/indonesia-map

# Docker Hub token
echo "your-docker-hub-token" | gh secret set DOCKER_TOKEN

# Database credentials
echo "yu71" | gh secret set DB_USERNAME
echo "53cret" | gh secret set DB_PASSWORD

# SSH private key (multi-line)
cat ~/.ssh/indonesia-map-deploy | gh secret set SSH_PRIVATE_KEY

# Verify secrets
gh secret list
```

#### Using GitHub Web Interface

1. Go to: https://github.com/hendisantika/indonesia-map/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret:
   - Name: `DOCKER_TOKEN`, Value: [your Docker Hub token]
   - Name: `DB_USERNAME`, Value: `yu71`
   - Name: `DB_PASSWORD`, Value: `53cret`
   - Name: `SSH_PRIVATE_KEY`, Value: [contents of private key file]

### 5. Test Deployment

```bash
# Make a commit to trigger deployment
git add .
git commit -m "test: trigger deployment"
git push origin main

# Watch the workflow
gh run watch
```

## Workflow Details

### PR Build Check Workflow
**Triggers:** Pull requests to main branch

**Steps:**
1. Checkout repository with LFS
2. Set up JDK 25
3. Build with Maven (skip tests)
4. Verify JAR created

**Duration:** ~3-5 minutes

### Build and Deploy Workflow
**Triggers:** Push to main branch

**Steps:**
1. **Build Stage**
   - Checkout with LFS
   - Set up JDK 25
   - Build with Maven
   - Extract version

2. **Docker Stage**
   - Set up Docker Buildx
   - Login to Docker Hub
   - Build multi-platform image
   - Push to Docker Hub
   - Tags: `latest`, `main-{sha}`, version

3. **Deploy Stage**
   - SSH to dev server
   - Pull latest image
   - Stop old container
   - Start new container
   - Health check

**Duration:** ~10-15 minutes

## Deployment Configuration

### Spring Profiles

The application uses Spring profiles to manage different environments:

- **default** - Local development (uses application.properties with hardcoded values)
- **dev** - Development server deployment (uses application-dev.properties with environment variables)

### Environment Variables (on Server)

The container is started with these environment variables:

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Database Configuration
DB_URL=jdbc:mysql://localhost:13306/wilayah_indo3?...
DB_USERNAME=[from GitHub secret]
DB_PASSWORD=[from GitHub secret]

# Server Configuration
SERVER_PORT=8080
```

These variables are injected from GitHub Actions secrets and environment variables during deployment.

### Network Configuration

The container uses `--network host` to access the MySQL database running on the host.

### Nginx Reverse Proxy

The application is accessible via Nginx reverse proxy:
- **Domain**: http://map.persislabs.my.id
- **Backend**: http://127.0.0.1:2000
- **Config**: `/etc/nginx/sites-available/map.persislabs.my.id.conf`

Nginx configuration proxies HTTP traffic on port 80 to the application running on port 2000.

### Port Mapping

- Application (dev profile): `2000:2000`
- Application (local): `8080:8080`
- MySQL: `13306:3306`

## Manual Deployment

If you need to deploy manually:

```bash
# SSH to server
ssh deployer@103.31.204.189

# Navigate to deployment directory
cd /home/deployer/maps

# Pull latest image
docker pull hendisantika/indonesia-map:latest

# Stop old container
docker stop indonesia-map
docker rm indonesia-map

# Start new container with dev profile
docker run -d \
  --name indonesia-map \
  --restart unless-stopped \
  -p 2000:2000 \
  -e SPRING_PROFILES_ACTIVE="dev" \
  -e DB_URL="jdbc:mysql://localhost:13306/wilayah_indo3?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true" \
  -e DB_USERNAME="yu71" \
  -e DB_PASSWORD="53cret" \
  -e SERVER_PORT="2000" \
  --network host \
  hendisantika/indonesia-map:latest

# Check logs
docker logs -f indonesia-map

# Check status
docker ps | grep indonesia-map
```

## Docker Commands

### View Logs
```bash
docker logs -f indonesia-map
docker logs --tail 100 indonesia-map
```

### Restart Container
```bash
docker restart indonesia-map
```

### Stop Container
```bash
docker stop indonesia-map
```

### Remove Container
```bash
docker rm -f indonesia-map
```

### Check Container Stats
```bash
docker stats indonesia-map
```

### Execute Commands in Container
```bash
docker exec -it indonesia-map sh
```

## Troubleshooting

### Deployment Failed - Can't Connect to Server

**Problem:** SSH connection refused

**Solution:**
```bash
# Verify SSH key is correct
ssh -i ~/.ssh/indonesia-map-deploy deployer@103.31.204.189

# Check server is accessible
ping 103.31.204.189

# Verify SSH service is running on server
systemctl status ssh
```

### Container Won't Start

**Problem:** Database connection error

**Solution:**
```bash
# Check MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker logs mysql-indonesia-map

# Verify credentials
docker exec -it mysql-indonesia-map mysql -u yu71 -p53cret wilayah_indo3
```

### Docker Hub Push Failed

**Problem:** Authentication error

**Solution:**
```bash
# Verify DOCKER_TOKEN secret is set correctly
gh secret list

# Test Docker Hub login locally
docker login -u hendisantika
```

### Application Not Accessible

**Problem:** Can't access http://103.31.204.189:2000 or http://map.persislabs.my.id

**Solution:**
```bash
# Check container is running
docker ps | grep indonesia-map

# Check container logs
docker logs --tail 50 indonesia-map

# Verify port is listening
netstat -tlnp | grep 2000

# Check firewall
sudo ufw status
sudo ufw allow 2000/tcp

# Check Nginx is proxying correctly
sudo nginx -t
sudo systemctl status nginx
```

### LFS Files Not Pulling

**Problem:** Migration files are Git LFS pointers

**Solution:**
```bash
# On GitHub Actions, ensure LFS checkout is enabled
# Already configured in workflow:
- uses: actions/checkout@v4
  with:
    lfs: true
- run: git lfs pull
```

## Monitoring

### Check Application Health

```bash
# From server
curl http://localhost:2000/actuator/health

# From external (via Nginx)
curl http://map.persislabs.my.id/actuator/health

# Direct port access
curl http://103.31.204.189:2000/actuator/health
```

### View Recent Deployments

```bash
# View workflow runs
gh run list --workflow=maven.yml --limit 10

# View specific run
gh run view [run-id]
```

## Rollback

If deployment fails, rollback to previous version:

```bash
# SSH to server
ssh deployer@103.31.204.189

# List available images
docker images | grep indonesia-map

# Stop current container
docker stop indonesia-map
docker rm indonesia-map

# Start with previous image tag
docker run -d \
  --name indonesia-map \
  --restart unless-stopped \
  -p 2000:2000 \
  -e SPRING_PROFILES_ACTIVE="dev" \
  -e DB_URL="jdbc:mysql://localhost:13306/wilayah_indo3?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true" \
  -e DB_USERNAME="yu71" \
  -e DB_PASSWORD="53cret" \
  -e SERVER_PORT="2000" \
  --network host \
  hendisantika/indonesia-map:[previous-tag]
```

## Security Best Practices

✅ **DO:**
- Use secrets for all sensitive data
- Rotate SSH keys regularly
- Use read-only database users where possible
- Enable firewall on server
- Use HTTPS in production
- Regular security updates

❌ **DON'T:**
- Commit secrets to repository
- Use root user for deployment
- Expose unnecessary ports
- Use same credentials across environments
- Skip security updates

## Production Checklist

Before deploying to production:

- [ ] Set up production database with backups
- [ ] Configure HTTPS with SSL certificate
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Set up reverse proxy (Nginx)
- [ ] Enable application metrics
- [ ] Set up separate production secrets
- [ ] Configure health check endpoints
- [ ] Set up staging environment
- [ ] Document rollback procedures

## Support

For issues:
1. Check workflow logs in GitHub Actions
2. Check container logs: `docker logs indonesia-map`
3. Check MySQL logs: `docker logs mysql-indonesia-map`
4. Review troubleshooting section above
5. Create issue at: https://github.com/hendisantika/indonesia-map/issues
