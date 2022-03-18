# Grab the latest Node base image
FROM node:17.7.1

# Install cron and browser packages
RUN apt-get update \
	&& apt-get install -y cron \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxtst6 libxss1 libx11-xcb1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

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

# Give it the correct permissions
RUN chmod +x /crontab.txt

# Add this to the crontab
RUN crontab /crontab.txt

# Start cron
RUN /etc/init.d/cron start

# Run the scraper for the first time
RUN npm run scraper

# Run the server
CMD npm run start
