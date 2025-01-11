#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting project cleanup...${NC}"

# Create essential directories
echo "Creating directories..."
mkdir -p client/src/components
mkdir -p client/src/types
mkdir -p client/src/utils
mkdir -p server/src/controllers
mkdir -p server/src/routes
mkdir -p server/src/types
mkdir -p server/src/utils
mkdir -p server/prisma

# Remove redundant files
echo "Removing redundant files..."
rm -rf client/README.md \
    server/README.md \
    client/.gitignore \
    server/.gitignore \
    client/src/App.test.tsx \
    client/src/setupTests.ts \
    client/src/reportWebVitals.ts \
    client/src/logo.svg \
    client/public/logo*.png \
    client/public/manifest.json \
    client/public/robots.txt

# List of essential files to keep/create
ESSENTIAL_FILES=(
    "server/package.json"
    "client/package.json"
    "server/src/controllers/accountController.ts"
    "server/.env"
    "server/src/types/index.ts"
    "client/src/components/AccountDetails.tsx"
    "server/src/utils/calculations.ts"
    "server/src/routes/accountRoutes.ts"
    "client/src/utils/calculations.ts"
    "server/prisma/schema.prisma"
)

# Create/verify essential files
echo "Verifying essential files..."
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Missing: $file${NC}"
        touch "$file"
        echo -e "${GREEN}Created: $file${NC}"
    else
        echo -e "${GREEN}Exists: $file${NC}"
    fi
done

echo -e "${GREEN}Cleanup complete!${NC}" 