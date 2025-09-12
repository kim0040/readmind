# ReadMind - Your Personal Speed Reading Trainer

**ReadMind** is a web-based tool designed to help you practice speed reading and analyze text. Paste in any text, upload a file, and ReadMind will display it word by word (or in chunks) at a speed you control (WPM/CPM), helping you improve focus and reading pace.

This project now features a full-fledged user authentication system, allowing you to save your settings and progress across devices. It includes a self-hostable backend, giving you full control over your data.

## ✨ Core Features

*   **Secure User Authentication**: Sign up and log in safely with an email and password. Your session is secured using JWT.
*   **Personalized Settings Sync**: Your preferred WPM/CPM, language, theme, and other settings are automatically saved to your account.
*   **Advanced Speed Reading**: Fine-tune your practice with WPM/CPM controls, word chunking (1, 2, or 3 words at a time), and a fixation point to guide your eyes.
*   **Versatile Text Input**: Paste text directly, upload `.txt` or `.md` files, or simply drag and drop a file onto the input area.
*   **User-Friendly Interface**: Enjoy a clean, responsive design with multi-language support, a dark mode, and full keyboard accessibility.
*   **In-Depth Text Analysis**: Get real-time statistics on your text, including character, word, and sentence counts, plus an estimated reading time.

## 🛠️ Technology Stack

*   **Frontend**: Vanilla JavaScript (ES6 Modules), Tailwind CSS, HTML5, CSS3
*   **Backend**: Node.js, Express.js, JSON Web Tokens (JWT) for authentication, `bcryptjs` for password hashing.
*   **Database**: SQLite (A lightweight, file-based database perfect for low-spec servers).
*   **Web Server**: Caddy (A powerful, modern web server with automatic HTTPS).

---

## 🚀 Deployment Guide (for Ubuntu 24.04)

This guide provides detailed, beginner-friendly steps to deploy the ReadMind application on a server running a modern Debian-based Linux distribution like Ubuntu 24.04. This setup is optimized for performance, even on low-specification servers.

### Step 1: Initial Server Setup

First, connect to your server via SSH. Then, follow these steps.

1.  **Clone the Repository**: Get the project code onto your server.
    ```bash
    # Replace <repository-url> with the actual Git URL
    git clone <repository-url>

    # Navigate into the newly created project directory
    cd <repository-directory>
    ```

2.  **Run the Setup Script**: This script conveniently installs all necessary software (Caddy, Node.js, npm) and backend dependencies for you.
    ```bash
    # Make the script executable
    chmod +x setup.sh

    # Run the script
    ./setup.sh
    ```

3.  **Configure the Firewall (UFW)**: To allow web traffic, you need to open the standard HTTP and HTTPS ports.
    ```bash
    # Allow SSH connections so you don't get locked out! (Very Important)
    sudo ufw allow ssh

    # Allow HTTP (port 80) and HTTPS (port 443) traffic
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp

    # Enable the firewall
    sudo ufw enable
    ```
    When you enable the firewall, it may ask for confirmation. Type `y` and press Enter.

### Step 2: Backend Configuration (Crucial for Security)

The backend uses JWT for secure user sessions and Google reCAPTCHA to prevent bots. You **must** configure secret keys for these to work.

1.  **Navigate to the Backend Directory**:
    ```bash
    cd backend
    ```
2.  **Create the Environment File**: This file, `.env`, will store your secret key. It is ignored by Git, so your key will not be exposed.
    ```bash
    # Generate a strong, random secret key and save it to the .env file
    echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
    ```
    *   **What this does**: `openssl rand -hex 32` generates a cryptographically secure 64-character random string. `echo "JWT_SECRET=..." > .env` writes this key into a new file named `.env`.
    *   **A Note on Password Security**: You do not need to configure a salt for password hashing. The `bcryptjs` library we use automatically generates a unique salt for each user and stores it as part of the hash, which is a modern security best practice.

2.  **Configure Google reCAPTCHA Keys**:
    To prevent bots, this application uses Google reCAPTCHA v2. You need to get your own API keys.
    *   Go to the [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/) and create a new site.
    *   Choose **reCAPTCHA v2** and then the **"I'm not a robot" Checkbox** option.
    *   Add your domain name where you will host the application.
    *   After creation, you will get a **Site Key** and a **Secret Key**.

3.  **Set the Environment Variables**:
    Open the `backend/.env` file you created earlier (`nano backend/.env`). Add your reCAPTCHA keys to it:
    ```
    RECAPTCHA_SECRET_KEY="YOUR_SECRET_KEY_HERE"
    ```
    Now, open the main frontend file `public/index.html` (`nano public/index.html`) and find the line with `g-recaptcha`. Replace the placeholder with your **Site Key**:
    ```html
    <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY_HERE"></div>
    ```

4.  **Return to the Project Root**:
    ```bash
    cd ..
    ```

### Step 3: Caddy Web Server Setup

Caddy will act as our web server, handling requests and automatically securing your site with a free SSL certificate (HTTPS).

1.  **Edit the Caddyfile**: You **must** replace the placeholder domain with your actual domain name.
    ```bash
    # Open the Caddyfile in the nano text editor
    nano Caddyfile
    ```
    The first line of the file is `your_domain.com`. Change this to your domain (e.g., `readmind.example.com`). Save the file by pressing `Ctrl+X`, then `Y`, then `Enter`.

2.  **Start and Enable the Caddy Service**: The `setup.sh` script already registered Caddy as a system service. Now, you just need to start it.
    ```bash
    # Start the Caddy server
    sudo systemctl start caddy

    # Enable Caddy to start automatically on server boot
    sudo systemctl enable caddy

    # Check the status to make sure it's running correctly
    sudo systemctl status caddy
    ```
    If the status is `active (running)`, you're good to go! Press `Q` to exit the status view.

### Step 4: Backend Service Setup (Using Systemd)

To ensure the backend server runs continuously (even if you close your terminal or reboot the server), we will register it as a `systemd` service.

1.  **Find Your Project's Absolute Path**: Services require a full, absolute path to your project files.
    ```bash
    # This command prints the current working directory. Copy this path!
    pwd
    # Example output: /home/ubuntu/readmind
    ```

2.  **Create the Service File**:
    ```bash
    sudo nano /etc/systemd/system/readmind-backend.service
    ```

3.  **Paste the Service Configuration**: Copy the entire block below and paste it into the `nano` editor.

    **IMPORTANT**: You **must** replace `YOUR_PROJECT_PATH` and `YOUR_USERNAME` with your actual values.
    *   `YOUR_PROJECT_PATH`: The path you copied from the `pwd` command.
    *   `YOUR_USERNAME`: Your username on the server. You can find this by running the `whoami` command.

    ```ini
    [Unit]
    Description=ReadMind Backend Server
    After=network.target

    [Service]
    # Replace with your actual username
    User=YOUR_USERNAME
    Group=YOUR_USERNAME

    # Replace with the absolute path to your project
    WorkingDirectory=YOUR_PROJECT_PATH/backend
    ExecStart=/usr/bin/node YOUR_PROJECT_PATH/backend/server.js

    Restart=always
    RestartSec=10
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=readmind-backend

    [Install]
    WantedBy=multi-user.target
    ```

4.  **Start the Backend Service**:
    ```bash
    # Reload systemd to recognize the new service file
    sudo systemctl daemon-reload

    # Start the backend service
    sudo systemctl start readmind-backend

    # Enable the service to start on boot
    sudo systemctl enable readmind-backend

    # Check the status to ensure it's running without errors
    sudo systemctl status readmind-backend
    ```
    If everything is working, you should see `active (running)`. Press `Q` to exit.

### Step 5: You're Live!

Congratulations! Your ReadMind instance is now fully deployed. Open your web browser and navigate to `https://your_domain.com` to start using the application.

### (Optional) Server Monitoring

Here are a few useful commands to monitor your new application and server health.

*   **Check Real-Time Resource Usage (`htop`)**:
    `htop` is a powerful, interactive process viewer. It gives you a real-time look at your server's CPU and memory usage.
    ```bash
    # If htop is not installed, you can install it with:
    # sudo apt update && sudo apt install htop -y

    # Run htop
    htop
    ```
    Press `F10` or `q` to exit.

*   **View Backend Logs (`journalctl`)**:
    Since the backend is running as a `systemd` service, its logs are managed by `journald`. You can view them easily.
    ```bash
    # View the logs for our specific backend service
    sudo journalctl -u readmind-backend.service

    # To follow the logs in real-time (like `tail -f`)
    sudo journalctl -u readmind-backend.service -f

    # To see the last 100 lines of logs
    sudo journalctl -u readmind-backend.service -n 100
    ```
    Press `Ctrl+C` to stop following the logs.

---

## (Optional) Advanced: Automatic Traffic Limiter

For servers with a limited monthly data plan, this script provides a safety net to prevent unexpected overage charges. It automatically shuts down the web server (Caddy) if your server's total network traffic exceeds a limit you define.

**How it Works:**
The script uses two core Linux utilities:
*   `vnstat`: A network traffic monitor that keeps a log of how much data has been transferred. The `setup.sh` script now installs this for you.
*   `iptables`: The standard Linux firewall. The script doesn't actually use this, it directly stops the `caddy` service. (Correction: The original description was slightly misleading, the script stops the service directly which is cleaner).

### Setup Instructions

1.  **Initialize `vnstat` Database (First Time Only)**:
    After installation, `vnstat` may need a moment to start monitoring your network interface. Run the following command to check its status.
    ```bash
    vnstat
    # If you see an error like "Error: Unable to read database", wait a few minutes
    # and try again. vnstat needs to collect some data first.
    ```

2.  **Configure the Script**:
    You need to tell the script which network interface to monitor and what your monthly limit is.
    ```bash
    # Make the script executable
    chmod +x traffic-limiter.sh

    # Open the script in an editor
    nano traffic-limiter.sh
    ```
    *   Change the `LIMIT_GB` variable to your monthly data limit in Gigabytes.
    *   Change the `INTERFACE` variable to match your server's main network interface (e.g., `eth0` or `ens5`). You can find this by running the `ip a` command.

3.  **Schedule with Cron**: To run the check automatically, add it to your system's scheduler.
    ```bash
    # Open the cron editor
    crontab -e
    ```
    Add the following line, making sure to replace `YOUR_PROJECT_PATH` with your project's absolute path.
    ```crontab
    # Run the traffic check every hour
    0 * * * * /usr/bin/sudo /bin/bash YOUR_PROJECT_PATH/traffic-limiter.sh >> YOUR_PROJECT_PATH/traffic-limiter.log 2>&1
    ```
This command runs the script every hour and logs its output to `traffic-limiter.log`.
