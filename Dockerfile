# Use an official Node.js runtime as a parent image
FROM node:23

# Set the working directory in the container
WORKDIR /app

# Install Netcat (nc)
RUN apt-get update && apt-get install -y netcat-openbsd

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Add the wait-for-mongo.sh script to the container
COPY wait-for-mongo.sh /wait-for-mongo.sh

# Make the wait script executable
RUN chmod +x /wait-for-mongo.sh

# Expose port 5000 for the backend server
EXPOSE 5000

# Command to wait for MongoDB to be ready, then start the server using nodemon
CMD /wait-for-mongo.sh && npm run start
