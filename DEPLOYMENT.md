# PreStake MVP Deployment Guide

This guide covers the complete deployment process for PreStake MVP, including smart contract deployment to Base Sepolia and frontend deployment to Vercel.

## Prerequisites

- Node.js 18+ installed
- Git repository with PreStake code
- Base Sepolia testnet access
- Vercel account
- GitHub account

## 1. Environment Setup

### Local Development

1. Copy the environment template:
```bash
cp env.example .env.local
```

2. Fill in your environment variables in `.env.local`:
```bash
# Base Network Configuration
NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org
NEXT_PUBLIC_BASE_CHAIN_ID=84532

# Smart Contract Deployment (keep secure!)
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# iExec DataProtector Configuration
IEXEC_API_URL=https://v7.bellecour.iex.ec/api

# Application Configuration
NEXT_PUBLIC_PROJECT_NAME=PreStake
NEXT_PUBLIC_URL=http://localhost:3000
```

### Production Environment Variables

For Vercel deployment, configure these environment variables in your Vercel dashboard:

- `NEXT_PUBLIC_BASE_RPC`: `https://sepolia.base.org`
- `NEXT_PUBLIC_BASE_CHAIN_ID`: `84532`
- `NEXT_PUBLIC_PROJECT_NAME`: `PreStake`
- `NEXT_PUBLIC_URL`: `https://your-app.vercel.app`
- `IEXEC_API_URL`: `https://v7.bellecour.iex.ec/api`

## 2. Smart Contract Deployment

### Manual Deployment

1. **Compile the contract:**
```bash
npx hardhat compile
```

2. **Deploy to Base Sepolia:**
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

3. **Verify the contract on BaseScan:**
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

### Automated Deployment (GitHub Actions)

The contract will be automatically deployed when you push to the `main` branch if you've configured the required secrets:

- `PRIVATE_KEY`: Your wallet private key for deployment
- `BASESCAN_API_KEY`: Your BaseScan API key for verification

## 3. Frontend Deployment to Vercel

### Method 1: Vercel Dashboard

1. **Connect GitHub Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci --legacy-peer-deps`

3. **Set Environment Variables:**
   - Add all production environment variables
   - Ensure `NEXT_PUBLIC_URL` matches your Vercel domain

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### Method 2: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

## 4. CI/CD Pipeline Setup

### GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `PRIVATE_KEY`: Your wallet private key (for contract deployment)
- `BASESCAN_API_KEY`: Your BaseScan API key

### Automated Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

1. **On Pull Request:**
   - Run tests and linting
   - Build the application
   - Upload build artifacts

2. **On Push to Main:**
   - Run all tests and build
   - Deploy frontend to Vercel
   - Deploy smart contract to Base Sepolia
   - Verify contract on BaseScan

## 5. Post-Deployment Verification

### Frontend Verification

1. **Visit your deployed URL**
2. **Test wallet connection**
3. **Verify all pages load correctly:**
   - Home page (`/`)
   - Matches page (`/matches`)
   - Lock forward page (`/lock/[id]`)
   - Positions page (`/positions`)
   - Marketplace page (`/marketplace`)

### Smart Contract Verification

1. **Check BaseScan:**
   - Visit [Base Sepolia Explorer](https://sepolia.basescan.org)
   - Search for your contract address
   - Verify contract is verified and source code is visible

2. **Test Contract Functions:**
   - Use the deployed frontend to test:
     - Locking forwards
     - Listing for sale
     - Buying forwards

## 6. Monitoring and Maintenance

### Vercel Monitoring

- Monitor deployment logs in Vercel dashboard
- Set up uptime monitoring
- Configure error tracking

### Smart Contract Monitoring

- Monitor contract transactions on BaseScan
- Set up alerts for contract events
- Track gas usage and costs

### Performance Monitoring

- Use Vercel Analytics for frontend performance
- Monitor API response times
- Track user engagement metrics

## 7. Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check environment variables
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Contract Deployment Issues:**
   - Verify private key has sufficient ETH for gas
   - Check network configuration
   - Ensure contract compiles without errors

3. **Frontend Issues:**
   - Check environment variables in Vercel
   - Verify API endpoints are accessible
   - Check browser console for errors

### Getting Help

- Check GitHub Issues for known problems
- Review Vercel documentation
- Consult Base documentation for network issues

## 8. Security Considerations

### Environment Variables

- Never commit private keys to version control
- Use GitHub Secrets for sensitive data
- Rotate API keys regularly

### Smart Contract Security

- Audit contracts before mainnet deployment
- Use multi-signature wallets for production
- Implement proper access controls

### Frontend Security

- Validate all user inputs
- Use HTTPS in production
- Implement proper error handling

## 9. Production Checklist

- [ ] Smart contract deployed and verified
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CI/CD pipeline working
- [ ] All pages tested and functional
- [ ] Wallet connection working
- [ ] Contract interactions tested
- [ ] Error handling verified
- [ ] Performance optimized
- [ ] Security measures in place

## 10. Next Steps

After successful deployment:

1. **User Testing:** Gather feedback from beta users
2. **Performance Optimization:** Monitor and optimize based on usage
3. **Feature Enhancements:** Add new features based on user feedback
4. **Mainnet Deployment:** Plan migration to Base mainnet
5. **Marketing:** Promote the application to target users

---

**Note:** This is an MVP deployment. For production use, ensure proper security audits, testing, and monitoring are in place.
