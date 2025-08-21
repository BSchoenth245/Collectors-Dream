# Docker Setup for Collector's Dream

## Quick Start with Docker

### Option 1: Docker Compose (Recommended)
```bash
# Clone and run
git clone https://github.com/BSchoenth245/Collectors-Dream.git
cd Collectors-Dream
docker-compose up -d

# Access at http://localhost:8000
```

### Option 2: Docker Commands
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Stop container
docker stop collectors-dream
```

## Benefits of Docker Version

- **Zero Setup**: No MongoDB installation required
- **Consistent Environment**: Works identically on Windows, Mac, Linux
- **Isolated**: Doesn't affect your system
- **Persistent Data**: Database survives container restarts
- **Easy Updates**: Pull new image and restart

## Docker Commands

```bash
# Start application
docker-compose up -d

# Stop application  
docker-compose down

# View logs
docker-compose logs -f

# Update to latest version
docker-compose pull && docker-compose up -d
```

## Data Persistence

Your collection data is stored in a Docker volume and persists between container restarts and updates.