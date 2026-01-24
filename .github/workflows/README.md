# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. PR Build Check (`maven-build.yml`)

**Purpose:** Validate pull requests before merging

**Triggers:**
- Pull requests to `main` branch

**Steps:**
1. Checkout repository with Git LFS
2. Pull LFS objects (large SQL migration files)
3. Set up JDK 25 with Maven cache
4. Build project with Maven (skip tests)
5. Verify JAR artifact created

**Duration:** ~3-5 minutes

**Badge:**
```markdown
[![PR Build Check](https://github.com/hendisantika/indonesia-map/actions/workflows/maven-build.yml/badge.svg)](https://github.com/hendisantika/indonesia-map/actions/workflows/maven-build.yml)
```

---

### 2. Build, Docker, and Deploy (`maven.yml`)

**Purpose:** Build, containerize, and deploy to dev server

**Triggers:**
- Push to `main` branch

**Steps:**

#### Build Stage
1. Checkout with LFS
2. Set up JDK 25
3. Build with Maven
4. Extract version from pom.xml

#### Docker Stage
5. Set up Docker Buildx
6. Login to Docker Hub
7. Extract Docker metadata (tags, labels)
8. Build multi-platform image
9. Push to Docker Hub with multiple tags:
   - `latest`
   - `main-{git-sha}`
   - `{version}`

#### Deploy Stage
10. SSH to dev server (103.31.204.189)
11. Pull latest Docker image
12. Stop and remove old container
13. Start new container with environment variables
14. Run health check
15. Show deployment summary

**Duration:** ~10-15 minutes

**Required Secrets:**
- `DOCKER_TOKEN` - Docker Hub personal access token
- `SSH_PRIVATE_KEY` - SSH key for deployment server
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

**Badge:**
```markdown
[![Build, Docker, and Deploy](https://github.com/hendisantika/indonesia-map/actions/workflows/maven.yml/badge.svg)](https://github.com/hendisantika/indonesia-map/actions/workflows/maven.yml)
```

---

## Environment Variables

Defined in workflows:

### Docker & Deployment
| Variable | Value | Description |
|----------|-------|-------------|
| `DOCKER_USERNAME` | hendisantika | Docker Hub username |
| `DOCKER_IMAGE_NAME` | indonesia-map | Docker image name |
| `DEPLOY_HOST` | 103.31.204.189 | Deployment server IP |
| `DEPLOY_USER` | deployer | Deployment user |
| `DEPLOY_PATH` | /home/deployer/maps | Deployment directory |

### Database Configuration
| Variable | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | localhost | Database host on dev server |
| `DB_PORT` | 13306 | Database port |
| `DB_NAME` | wilayah_indo3 | Database name |

### Application Configuration
| Variable | Value | Description |
|----------|-------|-------------|
| `SERVER_PORT` | 2000 | Application port (dev profile) |
| `SPRING_PROFILE` | dev | Spring profile for deployment |

---

## Required Secrets

### Setup Instructions

Run the interactive setup script:
```bash
./setup-github-secrets.sh
```

Or set manually:
```bash
# Docker Hub
echo "your-docker-token" | gh secret set DOCKER_TOKEN

# Database
echo "yu71" | gh secret set DB_USERNAME
echo "53cret" | gh secret set DB_PASSWORD

# SSH Deployment
cat ~/.ssh/indonesia-map-deploy | gh secret set SSH_PRIVATE_KEY
```

See [SECRETS_QUICK_REFERENCE.md](../../SECRETS_QUICK_REFERENCE.md) for details.

---

## Workflow Files

### maven-build.yml
```yaml
name: PR Build Check
on:
  pull_request:
    branches: [ main ]
```

### maven.yml
```yaml
name: Build, Docker, and Deploy
on:
  push:
    branches: [ main ]
```

---

## Docker Tags

Images are pushed with multiple tags:

| Tag Pattern | Example | Description |
|-------------|---------|-------------|
| `latest` | `hendisantika/indonesia-map:latest` | Always points to latest build |
| `main-{sha}` | `hendisantika/indonesia-map:main-a1b2c3d` | Git commit SHA |
| `{version}` | `hendisantika/indonesia-map:0.0.1-SNAPSHOT` | Maven version |

---

## Deployment Process

1. **Build:** Maven builds JAR with all dependencies
2. **Containerize:** Docker packages JAR into Alpine-based image
3. **Push:** Image pushed to Docker Hub
4. **Deploy:** SSH to server, pull image, restart container
5. **Verify:** Health check confirms deployment

---

## Monitoring

### View Workflow Runs
```bash
# List recent runs
gh run list --limit 10

# Watch current run
gh run watch

# View specific run
gh run view <run-id>
```

### Check Deployment
```bash
# SSH to server
ssh deployer@103.31.204.189

# Check container status
docker ps | grep indonesia-map

# View logs
docker logs -f indonesia-map

# Check health
curl http://localhost:8080/actuator/health
```

---

## Troubleshooting

### Workflow Failed - LFS Files

**Problem:** Migration files are Git LFS pointers

**Solution:** Ensure LFS checkout is enabled (already configured)

### Workflow Failed - Docker Hub

**Problem:** Login failed or authentication error

**Solution:**
1. Check `DOCKER_TOKEN` secret is set
2. Verify token has push permissions
3. Regenerate token at: https://hub.docker.com/settings/security

### Workflow Failed - SSH Deployment

**Problem:** Can't connect to deployment server

**Solution:**
1. Check `SSH_PRIVATE_KEY` secret is set correctly
2. Verify server is accessible: `ping 103.31.204.189`
3. Test SSH manually: `ssh deployer@103.31.204.189`
4. Check firewall allows SSH (port 22)

### Deployment Failed - Container Won't Start

**Problem:** Database connection error

**Solution:**
1. Check MySQL is running on server: `docker ps | grep mysql`
2. Verify `DB_USERNAME` and `DB_PASSWORD` secrets
3. Check database exists: `wilayah_indo3`
4. Review container logs: `docker logs indonesia-map`

---

## Security Notes

- All sensitive data stored as GitHub Secrets (encrypted)
- SSH key uses Ed25519 algorithm
- Docker Hub token has minimal required permissions
- Container runs as non-root user
- Database credentials passed via environment variables

---

## Manual Trigger

To manually trigger a workflow:

```bash
# Trigger maven.yml by pushing to main
git commit --allow-empty -m "trigger deployment"
git push origin main

# Or use GitHub CLI
gh workflow run maven.yml
```

---

## Rollback

If deployment fails:

```bash
# SSH to server
ssh deployer@103.31.204.189

# Stop current container
docker stop indonesia-map

# Start previous version
docker run -d --name indonesia-map \
  -p 8080:8080 \
  --network host \
  hendisantika/indonesia-map:<previous-tag>
```

---

## Documentation

- [Deployment Guide](../../DEPLOYMENT_GUIDE.md) - Complete deployment documentation
- [Secrets Quick Reference](../../SECRETS_QUICK_REFERENCE.md) - Secret setup commands
- [Docker Compose](../../docker-compose.yml) - Local development setup

---

## Support

For workflow issues:
1. Check workflow logs in GitHub Actions UI
2. Review troubleshooting section above
3. See [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md)
4. Create issue: https://github.com/hendisantika/indonesia-map/issues
