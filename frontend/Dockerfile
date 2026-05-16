# ─── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the React app via Vite
# This creates static assets in the /app/dist directory
RUN npm run build

# ─── Stage 2: Production Server ───────────────────────────
FROM nginx:alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for React Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs on port 80 by default
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
