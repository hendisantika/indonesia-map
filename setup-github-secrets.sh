#!/bin/bash

# GitHub Actions Secrets & Variables Setup Script
# for indonesia-map project

set -e

echo "=============================================="
echo "GitHub Actions Secrets & Variables Setup"
echo "=============================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo ""
    echo "Install with: brew install gh"
    echo "Then run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo ""
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Prompt user for values
read -p "Do you want to set up database secrets? (y/n): " setup_db
read -p "Do you want to set up Docker Hub secrets? (y/n): " setup_docker
read -p "Do you want to set up deployment SSH key? (y/n): " setup_ssh

echo ""
echo "Setting up secrets and variables..."
echo ""

# Database secrets
if [[ $setup_db == "y" ]]; then
    echo "📦 Database Configuration"
    read -p "Enter DB_USERNAME [default: yu71]: " db_user
    db_user=${db_user:-yu71}

    read -sp "Enter DB_PASSWORD [default: 53cret]: " db_pass
    echo ""
    db_pass=${db_pass:-53cret}

    read -p "Enter DB_HOST [default: localhost]: " db_host
    db_host=${db_host:-localhost}

    read -p "Enter DB_PORT [default: 13306]: " db_port
    db_port=${db_port:-13306}

    read -p "Enter DB_NAME [default: wilayah_indo3]: " db_name
    db_name=${db_name:-wilayah_indo3}

    # Create secrets
    echo "$db_user" | gh secret set DB_USERNAME
    echo "$db_pass" | gh secret set DB_PASSWORD

    # Create variables
    gh variable set DB_HOST --body "$db_host"
    gh variable set DB_PORT --body "$db_port"
    gh variable set DB_NAME --body "$db_name"

    echo "✅ Database secrets and variables created"
    echo ""
fi

# Docker secrets
if [[ $setup_docker == "y" ]]; then
    echo "🐳 Docker Hub Configuration"
    read -p "Enter DOCKER_USERNAME [default: hendisantika]: " docker_user
    docker_user=${docker_user:-hendisantika}

    read -sp "Enter DOCKER_TOKEN (Personal Access Token): " docker_token
    echo ""

    if [[ -z "$docker_token" ]]; then
        echo "⚠️  Skipping Docker secrets (no token provided)"
        echo ""
        echo "To create Docker Hub token:"
        echo "1. Go to https://hub.docker.com/settings/security"
        echo "2. Click 'New Access Token'"
        echo "3. Name: github-actions-indonesia-map"
        echo "4. Permissions: Read, Write, Delete"
        echo "5. Copy the token and run this script again"
        echo ""
    else
        # Create secrets
        echo "$docker_token" | gh secret set DOCKER_TOKEN

        # Create variables
        gh variable set DOCKER_USERNAME --body "$docker_user"
        gh variable set DOCKER_IMAGE_NAME --body "indonesia-map"

        echo "✅ Docker Hub secrets and variables created"
    fi
    echo ""
fi

# SSH deployment key
if [[ $setup_ssh == "y" ]]; then
    echo "🔑 SSH Deployment Configuration"
    echo ""

    read -p "Enter path to SSH private key [default: ~/.ssh/indonesia-map-deploy]: " ssh_key_path
    ssh_key_path=${ssh_key_path:-~/.ssh/indonesia-map-deploy}

    # Expand tilde
    ssh_key_path="${ssh_key_path/#\~/$HOME}"

    if [[ ! -f "$ssh_key_path" ]]; then
        echo "⚠️  SSH key not found at: $ssh_key_path"
        echo ""
        read -p "Do you want to generate a new SSH key? (y/n): " generate_key

        if [[ $generate_key == "y" ]]; then
            echo "Generating new SSH key..."
            ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$ssh_key_path" -N ""
            echo ""
            echo "✅ SSH key generated!"
            echo ""
            echo "Public key (add this to server):"
            echo "================================"
            cat "${ssh_key_path}.pub"
            echo "================================"
            echo ""
            echo "To add to server, run:"
            echo "ssh-copy-id -i ${ssh_key_path}.pub deployer@103.31.204.189"
            echo ""
            read -p "Press Enter after you've added the key to the server..."
        else
            echo "⚠️  Skipping SSH key setup"
            echo ""
        fi
    fi

    if [[ -f "$ssh_key_path" ]]; then
        echo "Setting SSH_PRIVATE_KEY secret..."
        cat "$ssh_key_path" | gh secret set SSH_PRIVATE_KEY
        echo "✅ SSH private key added to GitHub secrets"
    fi
    echo ""
fi

# Common variables
echo "⚙️  Common Configuration Variables"
gh variable set JAVA_VERSION --body "25"
gh variable set MAVEN_OPTS --body "-Xmx1024m -XX:MaxMetaspaceSize=512m"
echo "✅ Common variables created"
echo ""

echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""

echo "📋 Secrets created:"
gh secret list
echo ""

echo "📋 Variables created:"
gh variable list
echo ""

echo "Next steps:"
echo "1. Review secrets and variables above"
echo "2. Ensure server is prepared (see DEPLOYMENT_GUIDE.md)"
echo "3. Push a commit to main branch to trigger deployment"
echo "4. Monitor workflow: gh run watch"
echo ""
echo "Server setup commands (if not done):"
echo "  ssh deployer@103.31.204.189"
echo "  mkdir -p /home/deployer/maps"
echo "  sudo usermod -aG docker deployer"
echo ""
