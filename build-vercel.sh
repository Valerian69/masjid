#!/bin/bash
# Build script for Vercel deployment
# Rebuilds TV display, Admin panel, and syncs backend
# Run from project root: ./build-vercel.sh

set -e

echo "🔨 Building TV Display..."
cd frontend/tv-display
REACT_APP_API_URL=/api npm run build
cd ../..
rm -rf tv && cp -r frontend/tv-display/build tv
echo "✅ TV Display → tv/"

echo ""
echo "🔨 Building Admin Panel..."
cd frontend/admin-panel
PUBLIC_URL=/admin REACT_APP_API_URL=/api npm run build
cd ../..
rm -rf admin && cp -r frontend/admin-panel/build admin
echo "✅ Admin Panel → admin/"

echo ""
echo "📋 Syncing api/backend/..."
rsync -av --delete \
  --exclude='node_modules/' \
  --exclude='.env' \
  --exclude='db.json' \
  --exclude='uploads/' \
  --exclude='scripts/' \
  --exclude='.gitignore' \
  backend/ api/backend/
echo "✅ api/backend/"

echo ""
echo "🎉 All done! Ready to commit and push to Vercel."
