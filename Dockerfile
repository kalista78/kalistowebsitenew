FROM node:16-alpine

WORKDIR /app

# Set npm to use the default registry with max timeout
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-timeout 300000

# Install dependencies
RUN npm install -g typescript ts-node

# Copy package files and environment files
COPY package*.json ./
COPY server/package*.json ./server/
COPY .env* ./

# Install dependencies with legacy-peer-deps to bypass peerDependency issues
RUN npm install --legacy-peer-deps
RUN cd server && npm install --legacy-peer-deps

# Copy application code
COPY . .

# Create startup script to handle environment variables
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'if [ -n "$VITE_QUICKNODE_RPC_URL" ] && [ -z "$QUICKNODE_RPC_URL" ]; then' >> /app/start.sh && \
    echo '  export QUICKNODE_RPC_URL=$VITE_QUICKNODE_RPC_URL' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'npm run start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Build the applications
RUN npm run build || true
RUN cd server && npm run build || true

# Set up environment variables (will be overridden by Railway if provided there)
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application using our script
CMD ["/app/start.sh"] 