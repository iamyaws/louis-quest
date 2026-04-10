#!/bin/bash
# Deploy dev branch to /Ronki/dev/ for phone testing
# Live site stays at /Ronki/ (main branch)

set -e

echo "🔨 Building dev version..."
VITE_BASE=/Ronki/dev/ npx vite build --base /Ronki/dev/ --outDir dist-dev

echo "🚀 Deploying to gh-pages /dev/ subfolder..."
npx gh-pages -d dist-dev --dest dev

echo "✅ Dev deployed! Test at: https://iamyaws.github.io/Ronki/dev/"
