# GitHub Secrets Quick Reference

## Prerequisites
```bash
# Install GitHub CLI
brew install gh

# Login to GitHub
gh auth login
```

## Quick Setup Commands

### Option 1: Run Interactive Setup Script
```bash
./setup-github-secrets.sh
```

### Option 2: Manual Commands

#### Create Database Secrets
```bash
cd /Users/hendisantika/IdeaProjects/indonesia-map

echo "yu71" | gh secret set DB_USERNAME
echo "53cret" | gh secret set DB_PASSWORD
```

#### Create Database Variables
```bash
gh variable set DB_HOST --body "localhost"
gh variable set DB_PORT --body "13306"
gh variable set DB_NAME --body "wilayah_indo3"
```

#### Create Common Variables
```bash
gh variable set JAVA_VERSION --body "25"
gh variable set MAVEN_OPTS --body "-Xmx1024m"
```

#### Create Docker Secrets (Optional)
```bash
echo "your-docker-token" | gh secret set DOCKER_TOKEN
gh variable set DOCKER_USERNAME --body "hendisantika"
gh variable set DOCKER_IMAGE_NAME --body "indonesia-map"
```

## List Secrets & Variables
```bash
# List all secrets (won't show values)
gh secret list

# List all variables (shows values)
gh variable list
```

## Delete Secrets & Variables
```bash
# Delete a secret
gh secret delete DB_PASSWORD

# Delete a variable
gh variable delete DB_HOST
```

## Update Existing Secrets
```bash
# Update a secret (same command as create)
echo "new-password" | gh secret set DB_PASSWORD
```

## Web Interface Alternative

If you prefer using the GitHub website:

1. Go to: https://github.com/hendisantika/indonesia-map/settings/secrets/actions
2. Click "New repository secret"
3. Add secrets as needed

## Secrets vs Variables

| Type | Use For | Visibility | Access |
|------|---------|------------|--------|
| **Secrets** | Passwords, tokens, keys | Encrypted, hidden in logs | `${{ secrets.NAME }}` |
| **Variables** | Config values, URLs | Plain text, visible | `${{ vars.NAME }}` |

## Example Workflow Usage

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Build with database
      run: mvn clean package
      env:
        DB_HOST: ${{ vars.DB_HOST }}
        DB_PORT: ${{ vars.DB_PORT }}
        DB_USERNAME: ${{ secrets.DB_USERNAME }}
        DB_PASSWORD: ${{ secrets.DB_PASSWORD }}

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ vars.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_TOKEN }}
```

## Recommended Setup for This Project

### Minimal Setup (Just Build)
```bash
gh variable set JAVA_VERSION --body "25"
```

### Standard Setup (Build + Database)
```bash
# Secrets
echo "yu71" | gh secret set DB_USERNAME
echo "53cret" | gh secret set DB_PASSWORD

# Variables
gh variable set DB_HOST --body "localhost"
gh variable set DB_PORT --body "13306"
gh variable set DB_NAME --body "wilayah_indo3"
gh variable set JAVA_VERSION --body "25"
```

### Full Setup (Build + Database + Docker)
```bash
# Run the interactive setup script
./setup-github-secrets.sh
```

## Troubleshooting

### "gh: command not found"
```bash
brew install gh
```

### "403 Resource not accessible by integration"
```bash
# Re-authenticate with proper scopes
gh auth login --scopes "repo,workflow"
```

### Verify setup
```bash
# Check secrets exist
gh secret list

# Check variables
gh variable list

# Test in workflow (add to your .github/workflows/*.yml)
- name: Test secrets
  run: |
    echo "DB_USERNAME exists: ${{ secrets.DB_USERNAME != '' }}"
    echo "DB_HOST value: ${{ vars.DB_HOST }}"
```
