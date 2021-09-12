# Grab the latest Node base image
FROM node:14.17.6

# Set the current working directory inside the container
WORKDIR /scraper

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package.json
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the port to the outside world
EXPOSE 3001

# Copy the file which sets a schedule to automatically scrape
ADD crontab.txt /crontab.txt

# Add this to the crontab
RUN /usr/bin/crontab /crontab.txt

# Start the cron daemon
RUN /usr/sbin/crond -f -l 8

# Run the scraper for the first time
CMD ["npm", "run", "scraper"]

# Run the server
CMD ["npm", "run", "start"]
