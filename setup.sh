#!/bin/bash

# SmartHealth Setup Script
# This script automates the installation process

set -e

echo "╔════════════════════════════════════════╗"
echo "║   SmartHealth Setup Script            ║"
echo "║   Automated Installation              ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version must be 16 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check MySQL
echo "Checking MySQL installation..."
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8+ first."
    exit 1
fi

echo "✅ MySQL detected"

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed"

# Setup environment file
echo ""
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your credentials:"
    echo "   - Database password"
    echo "   - Africa's Talking API key"
    echo "   - Zenopay credentials"
    echo "   - JWT secret"
    echo ""
    read -p "Press Enter after you've configured .env file..."
else
    echo "✅ .env file already exists"
fi

# Setup database
echo ""
echo "Setting up database..."
read -p "Do you want to setup the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:setup
    echo "✅ Database setup complete"
else
    echo "⚠️  Skipping database setup. Run 'npm run db:setup' later."
fi

# Success message
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                  ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Access points:"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Default login:"
echo "  Email:    john.kamau@smarthealth.com"
echo "  Password: doctor123"
echo ""
echo "For more information, see:"
echo "  - INSTALLATION.md"
echo "  - docs/API.md"
echo "  - docs/USSD_FLOW.md"
echo ""
