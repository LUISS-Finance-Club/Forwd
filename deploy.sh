#!/bin/bash

# PreStake MVP Deployment Script
# This script helps with manual deployment of PreStake MVP

set -e

echo "🚀 PreStake MVP Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --legacy-peer-deps
    print_success "Dependencies installed successfully"
}

# Run linting and tests
run_tests() {
    print_status "Running linting..."
    npm run lint
    
    print_status "Running build test..."
    npm run build
    
    print_success "All tests passed"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_status "Logging into Vercel..."
    vercel login
    
    print_status "Deploying to production..."
    vercel --prod
    
    print_success "Deployed to Vercel successfully"
}

# Deploy smart contract
deploy_contract() {
    print_status "Deploying smart contract to Base Sepolia..."
    
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY environment variable is not set"
        print_warning "Please set your private key: export PRIVATE_KEY=your_private_key"
        exit 1
    fi
    
    npx hardhat run scripts/deploy.js --network baseSepolia
    
    print_success "Smart contract deployed successfully"
}

# Main deployment function
main() {
    echo ""
    print_status "Starting PreStake MVP deployment..."
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    run_tests
    
    # Ask user what to deploy
    echo ""
    print_status "What would you like to deploy?"
    echo "1) Frontend only (Vercel)"
    echo "2) Smart contract only (Base Sepolia)"
    echo "3) Both frontend and smart contract"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_vercel
            ;;
        2)
            deploy_contract
            ;;
        3)
            deploy_vercel
            deploy_contract
            ;;
        4)
            print_status "Exiting deployment script"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Verify your deployment on Vercel dashboard"
    echo "2. Check your contract on BaseScan"
    echo "3. Test all functionality on the deployed app"
    echo "4. Update your environment variables if needed"
    echo ""
}

# Run main function
main "$@"
