
# Docker Setup for OrthoPati-ENT

## Prerequisites
- Docker and Docker Compose installed on your system

## Running the Application with Docker

1. Clone the repository:
```
git clone <repository-url>
cd orthopati-ent
```

2. Start the application using Docker Compose:
```
docker-compose up -d
```

This will start both the application and a MySQL database container.

3. Access the application:
Open your browser and navigate to `http://localhost:8080`

## Environment Variables

You can customize the database connection by modifying these environment variables in the docker-compose.yml file:

- `DB_HOST`: MySQL host (default: mysql)
- `DB_USER`: MySQL username (default: orthouser)
- `DB_PASSWORD`: MySQL password (default: orthopass)
- `DB_NAME`: MySQL database name (default: orthopati_ent)

## Data Persistence

The MySQL data is stored in a Docker volume named `mysql_data`, ensuring that your data persists even if you stop or remove the containers.

## Stopping the Application

To stop the application:
```
docker-compose down
```

To stop the application and remove all data (including the database volume):
```
docker-compose down -v
```
