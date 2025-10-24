# Forwd

Forwd is a mobile-first decentralized web app built with Next.js (App Router). The app enables users to create, lock, and trade on-chain "forwards" — position-like financial instruments backed by Solidity smart contracts. It integrates wallet connectivity, ENS (Ethereum Name Service) for human-friendly names, and it has privacy-ready architecture using iExec's protectedDataAddress for encrypted bet data and oracle results.

This app is built as a mini app on Base (a layer-2 network). This README documents how to run, test, and develop the project.

you can view it here: https://prestake-2yy040clp-yasos-projects-8d2ad919.vercel.app

or watch a demo here: https://youtube.com/shorts/MDHS5n-qiKg?si=G3JYdruxRd1nBdhQ

Table of contents
- Quickstart
- Architecture & key integrations
- Contracts & deployments
- Development workflow
- Testing
- Environment variables
- Contributing
- Troubleshooting

Quickstart (Windows PowerShell)

1) Clone and install

```powershell
git clone <repo-url>
cd Forwd
npm install
```

2) Run the development server

```powershell
npm run dev
```

3) Open the app

Browse to http://localhost:3000. The main UI is implemented in `app/page.tsx` and uses a mobile-optimized layout with navigation tabs: Lock, My Forwards, Market, Options.

Architecture & key integrations
- Next.js (App Router) — pages/components under `app/`.
- Wallet/connect: `wagmi` + `connectkit` for multi-connector wallet flows.
- ENS (Ethereum Name Service): ENS names are used in the UI and some utilities under `utils/ens.js` and `utils/ensAdvanced.js` to resolve and display human-friendly names.
- Contract layers: `ethers` and `viem` helpers are included for interacting with deployed contracts.
- OnchainKit & iExec: `@coinbase/onchainkit` and `@iexec/dataprotector` are present for advanced on-chain flows and secure off-chain compute.
- Hardhat: used for compilation, testing, typechain, and deployment scripts.

Notable project folders
- `app/` — React UI (App Router). Main entry: `app/page.tsx`. Components live in `app/components/`.
- `contracts/` and `src/` — Solidity contracts. Multiple versions of BettingForwards exist (V2, V3); inspect each before interacting.
- `scripts/` — Node scripts for deployment: `deploy.js`, `deployV2.js`, `deployV3.js`, etc.
- `utils/` — contract ABIs, helper functions for ENS (see `utils/ens.js`, `utils/ensAdvanced.js`), iExec and contract interaction wrappers.

Contracts & deployment
- Contract files: `contracts/BettingForwardsV2.sol`, `contracts/BettingForwardsV3.sol`, and a legacy copy under `src/`.
- Use Hardhat for compiling and testing. Example:

```powershell
npx hardhat compile
npx hardhat test
```

- Deployment scripts: use the `scripts/` folder. Many scripts read environment variables (RPC URL, private key). See the `hardhat.config.js` to identify networks and variable names.

Development workflow
- UI: edit React components under `app/` and `app/components/`. The app uses client components for wallet interactions (see `app/page.tsx` which imports `LockForward`, `MyForwards`, `Marketplace`, `BuyOptions`, and `UserProfile`).
- Contracts: modify Solidity files under `contracts/`, run `npx hardhat compile`, update TypeChain types when needed.
- Type checking & linting: TypeScript is used; run `npm run build` or `tsc` to type check. Linting: `npm run lint`.

Scripts in package.json
- `dev` — Next dev server (local development).
- `build` — Next production build.
- `start` — Run built Next app.
- `lint` — Run ESLint.

Testing
- Unit tests (Hardhat + Mocha/Chai) are under `test/` and `ignition/modules`. Run:

```powershell
npx hardhat test
```

- Solidity coverage and gas-reporting devDependencies are available (`solidity-coverage`, `hardhat-gas-reporter`). Configure `hardhat.config.js` to enable them.

Environment variables
- The project expects certain env vars for deployments and integrations (RPC URLs, private keys, API keys for iExec or OnchainKit). Create a `.env` file in the repo root with values. Example variables to include in `.env.example` (suggested):

```
RPC_URL=...
DEPLOYER_PRIVATE_KEY=...
IEEXEC_API_KEY=...
INFURA_API_KEY=...
```

Contributing
- Recommended Pull Request checklist:
  - Run `npm install` and `npm run dev` to verify the UI.
  - Run `npx hardhat test` for contract tests.
  - Include an update to this README if the change affects setup.

Troubleshooting
- Wallet connection issues: ensure the running chain matches the configured RPC/network in your wallet and `hardhat.config.js`.
- Missing env variables: many scripts will error if required env vars are missing; create `.env` or use your shell to export them.

License & acknowledgements
- This repository was bootstrapped with `create-onchain`. See `package.json` for dependency versions.

Contact / Next steps
- Confirm deployed contract addresses (if any) and update README with addresses and ABIs.
- Add a `.env.example` file containing the expected environment variables and short descriptions.

If you'd like, I can now:
- Create a `.env.example` with inferred variable names from `hardhat.config.js` and `scripts/`.
<This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-onchain`](https://www.npmjs.com/package/create-onchain).


## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Learn More

To learn more about OnchainKit, see our [documentation](https://docs.base.org/onchainkit).

To learn more about Next.js, see the [Next.js documentation](https://nextjs.org/docs).
