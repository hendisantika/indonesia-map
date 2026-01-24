# Environment Variables Reference

This document describes all environment variables used in the Indonesia Map application.

## Spring Profiles

The application supports multiple Spring profiles:

### `default` (Local Development)
- **File**: `application.properties`
- **Use**: Local development on your machine
- **Database**: Hardcoded credentials (localhost:13306)
- **Activation**: Automatically active when no profile is specified
- **SQL Logging**: Enabled for debugging

### `dev` (Development Server)
- **File**: `application-dev.properties`
- **Use**: Deployment on dev server (103.31.204.189)
- **Database**: Environment variable-based configuration
- **Activation**: Set `SPRING_PROFILES_ACTIVE=dev`
- **SQL Logging**: Disabled for performance
- **Caching**: Thymeleaf caching enabled
- **Docker Compose**: Disabled (uses existing MySQL on server)

---

## Environment Variables

### Core Application

#### `SPRING_PROFILES_ACTIVE`
- **Description**: Active Spring profile
- **Values**: `default`, `dev`
- **Default**: `default`
- **Required**: No (recommended for deployment)
- **Example**: `SPRING_PROFILES_ACTIVE=dev`

---

### Database Configuration

#### `DB_URL`
- **Description**: Complete JDBC database URL
- **Required**: Yes (when using dev profile)
- **Default**: `jdbc:mysql://localhost:13306/wilayah_indo3?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true`
- **Example**:
  ```bash
  DB_URL="jdbc:mysql://localhost:13306/wilayah_indo3?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true"
  ```

#### `DB_USERNAME`
- **Description**: Database username
- **Required**: Yes (when using dev profile)
- **Default**: `yu71`
- **GitHub Secret**: Yes (stored as `DB_USERNAME`)
- **Example**: `DB_USERNAME=yu71`

#### `DB_PASSWORD`
- **Description**: Database password
- **Required**: Yes (when using dev profile)
- **Default**: `53cret`
- **GitHub Secret**: Yes (stored as `DB_PASSWORD`)
- **Security**: Never commit this value to git
- **Example**: `DB_PASSWORD=53cret`

---

### Server Configuration

#### `SERVER_PORT`
- **Description**: HTTP server port
- **Required**: No
- **Default**: `8080`
- **Example**: `SERVER_PORT=8080`

---

## Usage Examples

### Local Development

No environment variables needed - uses `application.properties`:

```bash
mvn spring-boot:run
```

### Docker Compose (Local)

Uses dev profile with environment variables in `docker-compose.yml`:

```bash
docker-compose up
```

### Docker Run (Manual)

```bash
docker run -d \
  --name indonesia-map \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_URL="jdbc:mysql://localhost:13306/wilayah_indo3?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true" \
  -e DB_USERNAME=yu71 \
  -e DB_PASSWORD=53cret \
  -e SERVER_PORT=8080 \
  --network host \
  hendisantika/indonesia-map:latest
```

### GitHub Actions Deployment

Environment variables are injected from GitHub secrets and workflow env vars.

See `.github/workflows/maven.yml` for the complete configuration.

---

## GitHub Actions Configuration

### Workflow Environment Variables

Defined in `.github/workflows/maven.yml`:

```yaml
env:
  # Docker Configuration
  DOCKER_USERNAME: hendisantika
  DOCKER_IMAGE_NAME: indonesia-map

  # Deployment Configuration
  DEPLOY_HOST: 103.31.204.189
  DEPLOY_USER: deployer
  DEPLOY_PATH: /home/deployer/maps

  # Database Configuration
  DB_HOST: localhost
  DB_PORT: 13306
  DB_NAME: wilayah_indo3

  # Application Configuration
  SERVER_PORT: 8080
  SPRING_PROFILE: dev
```

### GitHub Secrets

Must be configured in repository settings:

```bash
# Set up secrets using GitHub CLI
echo "your-docker-token" | gh secret set DOCKER_TOKEN
echo "yu71" | gh secret set DB_USERNAME
echo "53cret" | gh secret set DB_PASSWORD
cat ~/.ssh/indonesia-map-deploy | gh secret set SSH_PRIVATE_KEY
```

Or use the interactive setup script:

```bash
./setup-github-secrets.sh
```

---

## Profile-Specific Configuration

### application.properties (default profile)

```properties
# Hardcoded values for local development
spring.datasource.url=jdbc:mysql://localhost:13306/wilayah_indo3?...
spring.datasource.username=yu71
spring.datasource.password=53cret

# Development settings
spring.jpa.show-sql=true
spring.thymeleaf.cache=false
```

### application-dev.properties (dev profile)

```properties
# Environment variable-based configuration
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:13306/wilayah_indo3?...}
spring.datasource.username=${DB_USERNAME:yu71}
spring.datasource.password=${DB_PASSWORD:53cret}

# Production-like settings
spring.jpa.show-sql=false
spring.thymeleaf.cache=true
server.compression.enabled=true
```

---

## Security Best Practices

### DO ✅
- Store sensitive values in GitHub Secrets
- Use environment variables in dev/prod profiles
- Keep default profile with dummy/test credentials
- Never commit `.env` files with real credentials
- Rotate credentials regularly
- Use strong passwords (minimum 16 characters)

### DON'T ❌
- Hardcode production credentials in code
- Commit secrets to version control
- Use same credentials across environments
- Share credentials in plain text
- Use weak or default passwords
- Log sensitive environment variables

---

## Troubleshooting

### "Cannot connect to database"

**Check**: Database credentials are correct
```bash
# Verify environment variables are set
docker exec indonesia-map env | grep DB_

# Test database connection
docker exec indonesia-map wget -O- http://localhost:8080/actuator/health
```

### "Profile not found"

**Check**: SPRING_PROFILES_ACTIVE is set correctly
```bash
docker exec indonesia-map env | grep SPRING_PROFILES_ACTIVE
```

### "Port already in use"

**Check**: SERVER_PORT is not conflicting
```bash
# Check what's using port 8080
netstat -tlnp | grep 8080

# Or change the port
docker run ... -e SERVER_PORT=8081 -p 8081:8081 ...
```

---

## Environment Variable Precedence

Spring Boot resolves properties in this order (highest to lowest):

1. **Command-line arguments**: `--spring.datasource.username=user`
2. **Environment variables**: `DB_USERNAME=user`
3. **Profile-specific properties**: `application-dev.properties`
4. **Default properties**: `application.properties`

Example:
```bash
# Environment variable overrides profile property
docker run -e DB_USERNAME=override ...
# Uses "override" instead of value from application-dev.properties
```

---

## Additional Resources

- [Spring Boot Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html)
- [Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [.github/workflows/README.md](.github/workflows/README.md) - Workflow documentation
