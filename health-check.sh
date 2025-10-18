#!/bin/bash

# PreStake MVP Health Check Script
# This script performs basic health checks on the deployed application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL=${APP_URL:-"http://localhost:3000"}
CONTRACT_ADDRESS=${CONTRACT_ADDRESS:-""}
BASE_RPC=${BASE_RPC:-"https://sepolia.base.org"}

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

# Check if URL is accessible
check_url_accessibility() {
    print_status "Checking URL accessibility: $APP_URL"
    
    if curl -s --head "$APP_URL" | head -n 1 | grep -q "200 OK"; then
        print_success "URL is accessible"
        return 0
    else
        print_error "URL is not accessible"
        return 1
    fi
}

# Check if pages load correctly
check_pages() {
    local pages=("/" "/matches" "/positions" "/marketplace")
    
    print_status "Checking page accessibility..."
    
    for page in "${pages[@]}"; do
        local url="$APP_URL$page"
        if curl -s --head "$url" | head -n 1 | grep -q "200 OK"; then
            print_success "Page $page is accessible"
        else
            print_error "Page $page is not accessible"
            return 1
        fi
    done
    
    return 0
}

# Check API endpoints
check_api_endpoints() {
    print_status "Checking API endpoints..."
    
    # Check Farcaster endpoint
    local farcaster_url="$APP_URL/.well-known/farcaster.json"
    if curl -s "$farcaster_url" | grep -q "farcaster"; then
        print_success "Farcaster endpoint is working"
    else
        print_warning "Farcaster endpoint may not be working correctly"
    fi
    
    # Check auth endpoint
    local auth_url="$APP_URL/api/auth"
    if curl -s --head "$auth_url" | head -n 1 | grep -q "200 OK"; then
        print_success "Auth endpoint is accessible"
    else
        print_warning "Auth endpoint may not be working correctly"
    fi
}

# Check smart contract (if address provided)
check_smart_contract() {
    if [ -z "$CONTRACT_ADDRESS" ]; then
        print_warning "No contract address provided, skipping contract check"
        return 0
    fi
    
    print_status "Checking smart contract: $CONTRACT_ADDRESS"
    
    # Check if contract exists on Base Sepolia
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["'$CONTRACT_ADDRESS'","latest"],"id":1}' \
        "$BASE_RPC")
    
    if echo "$response" | grep -q '"result":"0x"'; then
        print_error "Contract not found at address: $CONTRACT_ADDRESS"
        return 1
    else
        print_success "Contract exists at address: $CONTRACT_ADDRESS"
    fi
    
    return 0
}

# Check environment variables
check_environment() {
    print_status "Checking environment configuration..."
    
    # Check if required environment variables are set
    local required_vars=("NEXT_PUBLIC_BASE_RPC" "NEXT_PUBLIC_BASE_CHAIN_ID" "NEXT_PUBLIC_PROJECT_NAME")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Environment variable $var is not set"
        else
            print_success "Environment variable $var is set"
        fi
    done
}

# Check build artifacts
check_build_artifacts() {
    print_status "Checking build artifacts..."
    
    if [ -d ".next" ]; then
        print_success "Build artifacts exist"
    else
        print_warning "Build artifacts not found. Run 'npm run build' first."
    fi
    
    if [ -f "lib/abi/BettingForwards.json" ]; then
        print_success "Contract ABI file exists"
    else
        print_warning "Contract ABI file not found"
    fi
}

# Run performance test
run_performance_test() {
    print_status "Running basic performance test..."
    
    local start_time=$(date +%s)
    curl -s "$APP_URL" > /dev/null
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $duration -lt 5 ]; then
        print_success "Page load time: ${duration}s (Good)"
    elif [ $duration -lt 10 ]; then
        print_warning "Page load time: ${duration}s (Acceptable)"
    else
        print_error "Page load time: ${duration}s (Slow)"
    fi
}

# Main health check function
main() {
    echo ""
    print_status "Starting PreStake MVP Health Check..."
    echo "=============================================="
    echo ""
    
    local exit_code=0
    
    # Run all checks
    check_url_accessibility || exit_code=1
    echo ""
    
    check_pages || exit_code=1
    echo ""
    
    check_api_endpoints || exit_code=1
    echo ""
    
    check_smart_contract || exit_code=1
    echo ""
    
    check_environment || exit_code=1
    echo ""
    
    check_build_artifacts || exit_code=1
    echo ""
    
    run_performance_test || exit_code=1
    echo ""
    
    # Summary
    echo "=============================================="
    if [ $exit_code -eq 0 ]; then
        print_success "All health checks passed! 🎉"
        echo ""
        print_status "Your PreStake MVP is ready for users!"
    else
        print_error "Some health checks failed. Please review the issues above."
        echo ""
        print_status "Fix the issues and run the health check again."
    fi
    echo ""
    
    return $exit_code
}

# Help function
show_help() {
    echo "PreStake MVP Health Check Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --url URL        Set the application URL (default: http://localhost:3000)"
    echo "  -c, --contract ADDR  Set the smart contract address"
    echo "  -r, --rpc URL        Set the Base RPC URL (default: https://sepolia.base.org)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  APP_URL              Application URL"
    echo "  CONTRACT_ADDRESS     Smart contract address"
    echo "  BASE_RPC             Base RPC URL"
    echo ""
    echo "Examples:"
    echo "  $0 --url https://prestake.vercel.app --contract 0x123..."
    echo "  APP_URL=https://prestake.vercel.app $0"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            APP_URL="$2"
            shift 2
            ;;
        -c|--contract)
            CONTRACT_ADDRESS="$2"
            shift 2
            ;;
        -r|--rpc)
            BASE_RPC="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
