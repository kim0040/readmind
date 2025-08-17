#!/bin/bash

# This script sets up the environment for the ReadMind application on a fresh Ubuntu server.
# It installs Caddy, Node.js, and all necessary dependencies.

set -e # Exit immediately if a command exits with a non-zero status.

echo "--- [Step 1/5] Updating package list and installing prerequisites ---"
sudo apt-get update
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl

echo "--- [Step 2/5] Adding Caddy GPG key and repository ---"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/config.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

echo "--- [Step 3/5] Correcting Caddy repository for Ubuntu Noble (24.04) ---"
sudo sed -i 's/any-distro/ubuntu/g; s/any-version/noble/g' /etc/apt/sources.list.d/caddy-stable.list

echo "--- [Step 4/5] Installing Caddy and Node.js v18 ---"
sudo apt-get update
sudo apt-get install -y caddy
sudo apt-get install -y nodejs npm

echo "--- [Step 5/5] Installing backend Node.js dependencies ---"
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/backend"
npm install

echo ""
echo "--- ✅ Setup Complete! ---"
echo ""
echo "To run the application:"
echo "1. Start the backend server:"
echo "   cd backend"
echo "   node server.js"
echo ""
echo "2. In a separate terminal, start the Caddy server from the project root:"
echo "   sudo caddy run"
echo ""
echo "The application will be available at https://localhost"
echo ""
