<div align="center">

# KarmaLedger

**On-chain developer reputation, minted from public GitHub activity.**

Built in 24 hours for [Hack Devengers 2.0](https://unstop.com/hackathons/hack-devengers-20-devengers-1749441), an open-innovation hackathon hosted on Unstop.

### 🚀 [Live Demo](https://karma-ledger-ten.vercel.app/)

· [Report a bug](../../issues) · [Smart contract](./src/KarmaToken.sol)

</div>

---

## What it is

KarmaLedger reads a developer's **public** GitHub activity, scores it with a logistic-regression model, and lets them mint that score as a **soulbound** (non-transferable) ERC-721 badge. The badge can't be bought, sold, or handed off to another wallet — it's reputation that travels with the person who earned it, verifiable by any contract or app that cares to check, without trusting KarmaLedger's own servers to still be online.

The problem it's solving: a GitHub-stats card is just a number on a webpage. Anyone can screenshot one, and it disappears the moment the app hosting it goes down. KarmaLedger signs the number instead of just displaying it, so the claim survives independently of the app that made it.

```
GitHub activity  →  feature extraction  →  logistic regression  →  score (0–1000)
                                                    │
                                     backend signs (score, wallet, nonce)
                                                    │
                                     wallet submits signature on-chain
                                                    │
                              soulbound ERC-721 badge minted / updated
```

---

## Deployed Contract

- **Network:** Ethereum Sepolia
- **Contract:** `KarmaToken`
- **Address:** `0xA300DebaDBa30AA663418d485ab65aAB26D3D58B`
- **Chain ID:** `11155111`

**Verified contract:**  
https://sepolia.etherscan.io/address/0xa300debadba30aa663418d485ab65aab26d3d58b

The contract source code is verified on Etherscan, so the deployed bytecode can be inspected directly and the contract's public functions can be called from the explorer.

## How a score becomes a badge

1. **Read the public record.** The backend pulls a GitHub user's profile, repos, and recent public events from the GitHub REST API — no OAuth, no private data, no account access.
2. **Score it.** Five signals are normalized and run through a small logistic-regression model (trained offline, weights checked into the repo as JSON), producing a 0–1000 score and a per-feature contribution breakdown.
3. **Sign it.** If the user wants to mint, the backend signs `(recipient, score, githubUsername, nonce, contractAddress)` with a private key whose address is hardcoded into the contract as the `trustedSigner`.
4. **Mint it.** The connected wallet submits that signature to `KarmaToken.mintOrUpdateKarma`. The contract recovers the signer from the signature, checks it matches `trustedSigner`, checks the exact payload hasn't been used before, and mints a new badge — or updates the existing one, since each wallet holds exactly one.
5. **It's stuck there.** `KarmaToken` overrides `_update`, `approve`, and `setApprovalForAll` to revert on anything that isn't a mint or a burn, so the badge can never change hands.

### The five scored signals

| Signal             | What it measures                                                              |
| ------------------ | ----------------------------------------------------------------------------- |
| Commit frequency   | Push activity over the last ~90 days of public events                         |
| Language diversity | Distinct languages used across the user's repos                               |
| Project depth      | Average commits per repo — rewards sustained work over one-off repos          |
| Community signal   | Followers and stars received, log-scaled so it can't dominate the score alone |
| Consistency        | Longest streak of consecutive active days in recent activity                  |

### Tiers

| Tier     | Score range |
| -------- | ----------- |
| Bronze   | 0 – 399     |
| Silver   | 400 – 599   |
| Gold     | 600 – 799   |
| Platinum | 800 – 1000  |

## Tech stack

| Layer          | Stack                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Smart contract | Solidity 0.8.20, OpenZeppelin (`ERC721`, `Ownable`, `ECDSA`), Foundry                                                     |
| Backend        | Node.js, Express, MongoDB (Mongoose), ethers.js                                                                           |
| Scoring model  | Python (NumPy) for training, plain-JSON weights, inference re-implemented in Node so requests need zero Python at runtime |
| Frontend       | React 18, Vite, Tailwind CSS, React Router                                                                                |
| Wallet         | wagmi, viem, RainbowKit                                                                                                   |

## Repository layout

```
karma-ledger/
├── src/KarmaToken.sol       # the soulbound ERC-721 contract
├── test/KarmaToken.t.sol    # Foundry tests (signature replay, soulbound checks, tiers)
├── scripts/Deploy.s.sol     # forge deploy script
├── lib/                     # forge-std, OpenZeppelin (git submodules)
├── foundry.toml
│
├── server/                  # Express API + MongoDB
│   ├── routes/               score.js · mint.js · leaderboard.js
│   ├── services/              githubService.js · mlScorer.js · signer.js
│   └── models/Profile.js
│
├── ml/
│   ├── train_model.py        # trains the logistic-regression model
│   └── weights.json          # trained weights, consumed by server/services/mlScorer.js
│
└── client/                  # React + Vite frontend
    └── src/
        ├── pages/             Home · Score · Ledger · HowItWorks · Faq
        ├── components/        Navbar · MintButton · ScoreCard · Leaderboard · ...
        └── services/          api.js (backend) · web3.js (contract ABI + calls)
```

## Getting started

### Prerequisites

- Node.js 18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `anvil`, `cast`)
- MongoDB running locally, or an Atlas connection string
- Python 3 + NumPy, only if you want to retrain the scoring model

### 1. Clone with submodules

The contract depends on `forge-std` and OpenZeppelin as git submodules — a plain clone will leave `lib/` empty.

```bash
git clone --recurse-submodules https://github.com/1khushibarnwal/karma-ledger.git
cd karma-ledger
```

Already cloned without `--recurse-submodules`? Run:

```bash
git submodule update --init --recursive
```

### 2. Start a local chain

```bash
anvil
```

Leave this running. It prints 10 funded test accounts with their private keys — you'll need two of them next.

### 3. Deploy the contract

In a new terminal, from the repo root:

```bash
forge build
forge test

export DEPLOYER_PRIVATE_KEY=<a private key anvil printed>
export SIGNER_ADDRESS=<the address of a *different* anvil account — this becomes the backend's trusted signer>

forge script scripts/Deploy.s.sol --rpc-url localhost --broadcast
```

Copy the deployed `KarmaToken` address from the console output — you'll need it in both `.env` files below.

> **Why two different accounts?** `DEPLOYER_PRIVATE_KEY` pays gas to deploy the contract. `SIGNER_ADDRESS` is baked into the contract as the only address whose signature `mintOrUpdateKarma` will accept — that key lives in the backend's `.env` as `SIGNER_PRIVATE_KEY`, not the deployer's. Keeping them separate means losing one key doesn't compromise the other role.

### 4. Start the backend

```bash
cd server
cp .env.example .env
npm install
```

Fill in `server/.env`:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/KarmaLedger

# Optional — raises the GitHub API rate limit from 60/hr to 5000/hr.
# Create at https://github.com/settings/tokens, no scopes needed.
GITHUB_TOKEN=

# The private key matching the SIGNER_ADDRESS you deployed with above.
# Never use a real-funds wallet's key here, even for a hackathon.
SIGNER_PRIVATE_KEY=

# The KarmaToken address forge script printed in step 3.
CONTRACT_ADDRESS=
```

```bash
npm run dev
```

The API listens on `http://localhost:5000` by default, with routes under `/api/score`, `/api/mint`, and `/api/leaderboard`.

### 5. Start the frontend

```bash
cd client
cp .env.example .env
npm install
```

Fill in `client/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=<the same KarmaToken address from step 3>

# Optional — needed only for WalletConnect / mobile wallets.
# Free project id from https://cloud.reown.com. MetaMask and other
# browser-extension wallets work fine without it.
VITE_WALLETCONNECT_PROJECT_ID=
```

```bash
npm run dev
```

Open `http://localhost:5173`. Score a GitHub profile, connect a wallet (point MetaMask at `http://127.0.0.1:8545`, chain ID `31337`, and import one of Anvil's funded accounts), and mint.

### (Optional) Retrain the scoring model

```bash
cd ml
pip install numpy
python train_model.py
```

This overwrites `ml/weights.json`. Copy it over `server/services/weights.json` for the backend to pick up the new weights — the two are kept as separate files rather than one shared path so the backend has no runtime dependency on the `ml/` directory.

## API reference

| Method | Route                  | Body                                        | What it does                                                                                        |
| ------ | ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/score/:username` | —                                           | Fetches a GitHub profile, scores it, upserts it into MongoDB, returns the score + feature breakdown |
| `GET`  | `/api/leaderboard`     | —                                           | Top 50 scored profiles, sorted by score descending                                                  |
| `POST` | `/api/mint/authorize`  | `{ githubUsername, walletAddress }`         | Looks up the user's last computed score, signs a mint payload for that wallet                       |
| `POST` | `/api/mint/confirm`    | `{ githubUsername, walletAddress, txHash }` | Records the on-chain transaction hash against the profile, once the mint confirms                   |

## Smart contract reference

`KarmaToken` — `src/KarmaToken.sol`

| Function                                                      | Description                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `mintOrUpdateKarma(score, githubUsername, nonce, signature)`  | Verifies the signature came from `trustedSigner`, then mints a new badge or updates the caller's existing one |
| `tokenOfOwner(address) → uint256`                             | The token ID held by a wallet, or `0` if none                                                                 |
| `karmaOf(uint256) → (score, githubUsername, timestamp, tier)` | Full badge data for a token ID                                                                                |
| `setTrustedSigner(address)`                                   | Owner-only; rotates which address's signatures the contract accepts                                           |

Every payload hash is marked used after a successful mint, so a signature can't be replayed. Transfers, `approve`, and `setApprovalForAll` all revert unconditionally — the only two state transitions a token can undergo are mint and burn.

Run the test suite:

```bash
forge test -vvv
```

## An honest look at the trust model

This was built in 24 hours, and it's worth being direct about where it's decentralized and where it isn't:

- **The ledger is fully decentralized.** Once a badge is minted, anyone with an RPC connection can read `karmaOf` independently — no trust in KarmaLedger's frontend or backend required, even if both disappear.
- **The scoring is not.** `SIGNER_PRIVATE_KEY` is a single backend-controlled key. It decides what score gets signed, which means the system currently trusts one server to compute honestly. A production version would want this to be a multisig, a verifiable off-chain computation, or a decentralized oracle network instead of one key.
- **The signature proves attribution, not correctness.** It proves "KarmaLedger's scoring service said this score, for this user, at this time" — it doesn't independently prove the score is fair. What it removes is the ability to fake or alter that claim after the fact, or attach someone else's score to your wallet.

## Team & hackathon

Built by [**Khushi Barnwal**](https://github.com/1khushibarnwal) for **[Hack Devengers 2.0](https://unstop.com/hackathons/hack-devengers-20-devengers-1749441)** — a 24-hour, fully virtual Open Innovation hackathon hosted on Unstop, with no fixed problem statement or restricted tech stack.
