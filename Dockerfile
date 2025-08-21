# Use Node.js base image
FROM node:18-alpine

# Install MongoDB
RUN apk add --no-cache mongodb mongodb-tools

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create MongoDB data directory
RUN mkdir -p /data/db

# Expose port
EXPOSE 8000

# Start script that runs MongoDB and the app
CMD ["sh", "-c", "mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log && npm start"]