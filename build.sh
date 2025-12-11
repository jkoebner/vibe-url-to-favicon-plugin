#!/bin/bash

# Build Firefox extension
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
BUILD_NAME="tab-favicon-labeler-v${VERSION}.zip"

# Clean previous build
rm -f *.zip

# Create zip excluding development files
zip -r "$BUILD_NAME" . -x "*.git*" "*.zip" "build.sh" "README.md" "LICENSE"

echo "Built: $BUILD_NAME"