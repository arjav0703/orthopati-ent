# Clinic Patient Management System
---
## Tech Stack
- Server: Nodejs
- Web Interface: React (bundled with Vite)
- Database: MariaDB (SQL-based)
- Deployment: Docker (docker compose)

current tested on Linux (arch btw)
---
## Local Installation
  - ### Docker
    - Install Docker (https://docs.docker.com/engine/install/)
    - Clone the Repository
    - run `docker compose up` to start the application
  - ### Nodejs
    #### Setup Node
      - Install Nodejs (https://nodejs.org/en/download/)
      - Clone the Repository
      - run `npm install` to install dependencies
      - run `npm run build` to build the frontend
    #### Setup Server
      - Download MariaDB (https://mariadb.org/download/)
      - Create a User with `CREATE USER 'username'@'hostname' IDENTIFIED BY 'password';`
    - Grant privileges to the user: `GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'hostname';`
    #### Start Server
      - you might want to reconfigure .env file to your needs
      - run `node server.js` to start the application with backend
