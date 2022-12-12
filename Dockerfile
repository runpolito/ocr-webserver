FROM ubuntu:latest
LABEL org.opencontainers.image.authors="runpolito"

# Environment variables
ENV PORT=3001

# Install tesseract for OCR
RUN apt-get update
RUN apt-get install -y tesseract-ocr-ita
RUN apt-get install -y tesseract-ocr-eng
# Install Node.js and npm
RUN apt-get install -y nodejs npm

# Create app directory
WORKDIR /usr/src/app

# Install npm dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./
RUN npm install

# Copy files
COPY . .

# Expose port
EXPOSE $PORT
# Run the app
CMD [ "node", "server.js" ]