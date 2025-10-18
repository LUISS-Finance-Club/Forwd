# PreStake MVP Post-Deployment Verification Guide

This guide provides a comprehensive checklist for verifying that PreStake MVP has been deployed correctly and is functioning as expected.

## Pre-Deployment Checklist

### Environment Variables
- [ ] All required environment variables are set in Vercel
- [ ] `NEXT_PUBLIC_BASE_RPC` points to correct Base network
- [ ] `NEXT_PUBLIC_BASE_CHAIN_ID` matches target network
- [ ] `NEXT_PUBLIC_PROJECT_NAME` is set to "PreStake"
- [ ] `NEXT_PUBLIC_URL` matches deployed domain
- [ ] `IEXEC_API_URL` is configured for iExec DataProtector

### Smart Contract
- [ ] Contract compiles without errors
- [ ] Contract deployed to Base Sepolia
- [ ] Contract verified on BaseScan
- [ ] Contract address saved to `lib/abi/BettingForwards.json`
- [ ] Contract owner is correct address

## Frontend Verification

### 1. Basic Functionality

#### Home Page (`/`)
- [ ] Page loads without errors
- [ ] PreStake branding displays correctly
- [ ] Navigation links work properly
- [ ] Wallet connection button is visible
- [ ] Responsive design works on mobile/desktop

#### Matches Page (`/matches`)
- [ ] Mock match data displays correctly
- [ ] Match cards show proper information
- [ ] "Lock Forward" buttons are functional
- [ ] Navigation to marketplace works
- [ ] Responsive grid layout works

#### Lock Forward Page (`/lock/[id]`)
- [ ] Dynamic routing works for different match IDs
- [ ] Form validation works correctly
- [ ] Stake amount validation functions
- [ ] Encryption process works (mock implementation)
- [ ] Error handling displays properly
- [ ] Loading states work correctly
- [ ] Success states display properly

#### Positions Page (`/positions`)
- [ ] User positions display correctly
- [ ] Decryption functionality works (mock implementation)
- [ ] Empty state displays when no positions
- [ ] Error handling for decryption failures
- [ ] Retry functionality works
- [ ] Responsive design works

#### Marketplace Page (`/marketplace`)
- [ ] Forward listings display correctly
- [ ] Filtering functionality works
- [ ] Sorting options work properly
- [ ] ForwardCard components render correctly
- [ ] Buy buttons work (mock implementation)
- [ ] Ownership detection works
- [ ] Responsive grid layout works
- [ ] Empty states display properly

### 2. Wallet Integration

#### Wallet Connection
- [ ] ConnectWallet component renders
- [ ] Wallet connection process works
- [ ] Connected wallet address displays
- [ ] Wallet disconnection works
- [ ] Multiple wallet types supported

#### OnchainKit Integration
- [ ] Base network configuration correct
- [ ] Chain switching works
- [ ] Transaction signing works
- [ ] Error handling for failed transactions
- [ ] Loading states during transactions

### 3. iExec DataProtector Integration

#### Encryption (Mock Implementation)
- [ ] Stake encryption works
- [ ] Encrypted reference generation
- [ ] Error handling for encryption failures
- [ ] Loading states during encryption
- [ ] Success feedback after encryption

#### Decryption (Mock Implementation)
- [ ] Stake decryption works for owners
- [ ] Error handling for decryption failures
- [ ] Loading states during decryption
- [ ] Retry functionality works
- [ ] Non-owners see encrypted state

### 4. UI/UX Verification

#### Responsive Design
- [ ] Mobile layout works correctly
- [ ] Tablet layout works correctly
- [ ] Desktop layout works correctly
- [ ] Touch interactions work on mobile
- [ ] Navigation is accessible on all devices

#### Performance
- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] No console errors
- [ ] Smooth animations and transitions
- [ ] Proper loading states

#### Accessibility
- [ ] Proper heading hierarchy
- [ ] Alt text for images
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Screen reader compatibility

## Smart Contract Verification

### 1. Contract Deployment
- [ ] Contract deployed successfully
- [ ] Contract address is valid
- [ ] Contract verified on BaseScan
- [ ] Source code is visible on BaseScan
- [ ] Contract ABI is accessible

### 2. Contract Functions
- [ ] `lockForward` function works
- [ ] `listForSale` function works
- [ ] `buyForward` function works
- [ ] `getUserForwards` function works
- [ ] `getMatchForwards` function works
- [ ] `getForwardsForSale` function works
- [ ] `withdrawFees` function works (owner only)
- [ ] `setPlatformFee` function works (owner only)

### 3. Contract Security
- [ ] Access controls work properly
- [ ] Reentrancy protection is active
- [ ] Input validation works
- [ ] Event emissions are correct
- [ ] Gas optimization is reasonable

## Integration Testing

### 1. End-to-End Workflows

#### Forward Locking Flow
1. [ ] Navigate to matches page
2. [ ] Click "Lock Forward" on a match
3. [ ] Fill in stake amount and odds
4. [ ] Submit form
5. [ ] Verify encryption process
6. [ ] Confirm transaction
7. [ ] Verify forward appears in positions

#### Forward Trading Flow
1. [ ] List a forward for sale
2. [ ] Navigate to marketplace
3. [ ] Find the listed forward
4. [ ] Click "Buy" button
5. [ ] Confirm transaction
6. [ ] Verify ownership transfer
7. [ ] Verify forward removed from marketplace

### 2. Error Scenarios
- [ ] Insufficient funds handling
- [ ] Network errors handling
- [ ] Invalid input handling
- [ ] Transaction rejection handling
- [ ] Wallet disconnection handling

## Performance Testing

### 1. Load Testing
- [ ] Multiple concurrent users
- [ ] Large number of forwards
- [ ] Complex filtering operations
- [ ] Multiple wallet connections

### 2. Network Testing
- [ ] Slow network conditions
- [ ] Network disconnection/reconnection
- [ ] Different network providers
- [ ] Mobile network testing

## Security Verification

### 1. Frontend Security
- [ ] No sensitive data in client-side code
- [ ] Proper input validation
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers

### 2. Smart Contract Security
- [ ] Access control verification
- [ ] Reentrancy protection
- [ ] Integer overflow protection
- [ ] Proper event logging
- [ ] Gas optimization

## Monitoring Setup

### 1. Error Tracking
- [ ] Frontend error monitoring
- [ ] Smart contract event monitoring
- [ ] Transaction failure tracking
- [ ] User interaction tracking

### 2. Performance Monitoring
- [ ] Page load time monitoring
- [ ] API response time monitoring
- [ ] Transaction confirmation time
- [ ] User engagement metrics

## Production Readiness Checklist

### 1. Code Quality
- [ ] All tests pass
- [ ] No ESLint errors
- [ ] TypeScript compilation successful
- [ ] Code review completed
- [ ] Documentation updated

### 2. Infrastructure
- [ ] Vercel deployment successful
- [ ] Domain configured correctly
- [ ] SSL certificate active
- [ ] CDN configured
- [ ] Monitoring alerts set up

### 3. Smart Contract
- [ ] Contract audited (if applicable)
- [ ] Multi-signature wallet setup
- [ ] Emergency pause functionality
- [ ] Upgrade mechanism (if needed)
- [ ] Gas optimization verified

### 4. User Experience
- [ ] All user flows tested
- [ ] Error messages are user-friendly
- [ ] Loading states are clear
- [ ] Success feedback is appropriate
- [ ] Mobile experience is smooth

## Troubleshooting Common Issues

### Frontend Issues
1. **Page not loading:**
   - Check Vercel deployment logs
   - Verify environment variables
   - Check browser console for errors

2. **Wallet connection failing:**
   - Verify OnchainKit configuration
   - Check network configuration
   - Ensure wallet is unlocked

3. **Transaction failures:**
   - Check gas settings
   - Verify wallet has sufficient funds
   - Check network congestion

### Smart Contract Issues
1. **Deployment failures:**
   - Verify private key has ETH
   - Check network configuration
   - Ensure contract compiles

2. **Verification failures:**
   - Check BaseScan API key
   - Verify contract source code
   - Ensure correct constructor arguments

## Post-Verification Actions

### 1. Documentation
- [ ] Update deployment documentation
- [ ] Record contract addresses
- [ ] Document any issues found
- [ ] Update user guides

### 2. Monitoring
- [ ] Set up alerts for critical issues
- [ ] Monitor user feedback
- [ ] Track performance metrics
- [ ] Monitor contract events

### 3. Maintenance
- [ ] Schedule regular health checks
- [ ] Plan for updates and improvements
- [ ] Monitor gas costs
- [ ] Track user adoption

---

## Quick Verification Commands

```bash
# Test build locally
npm run build

# Run linting
npm run lint

# Test smart contract compilation
npx hardhat compile

# Check deployment status
vercel ls

# Verify contract on BaseScan
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

---

**Note:** This verification guide should be completed before announcing the MVP to users. All critical items must pass before considering the deployment successful.
