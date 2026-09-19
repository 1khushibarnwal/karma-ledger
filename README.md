# KarmaChain

**On-chain developer reputation, scored by ML, verified by GitHub, minted as a soulbound NFT.**

Built for Hack Devengers 2.0 (open innovation) — combines ML, blockchain, and the MERN stack.

## The pitch (30 seconds)

Résumés can be embellished. Reviews can be bought. GitHub stars can be farmed. KarmaChain
looks at what a developer *actually did* — commit frequency, sustained project depth,
consistency, language range, community signal — runs it through a trained model, and
lets the developer mint that score as a **soulbound token**: an NFT that is permanently
tied to their wallet and can never be transferred, sold, or faked, because minting
requires a cryptographic signature from KarmaChain's own scoring service. It's a
reputation layer that travels with a person across any platform that chooses to read it.

## Architecture

```
GitHub REST API ──▶ Express backend ──▶ ML scorer (trained logistic regression)
                                    │
                                    ▼
                         backend signs (score, user, nonce)
                                    │
                                    ▼
                    React frontend + MetaMask ──▶ smart contract
                                    │
                         verifies signature on-chain,
                       mints/updates a non-transferable ERC-721
                                    │
                                    ▼
                          MongoDB caches scores for the leaderboard
```

- **src/KarmaToken.sol** — a soulbound ERC-721, built and tested with **Foundry**.
  Every transfer path is blocked at the contract level (`_update`, `approve`,
  `setApprovalForAll` all revert except for the initial mint). Minting requires an
  ECDSA signature from a trusted backend wallet, recovered on-chain with
  OpenZeppelin's `ECDSA`/`MessageHashUtils`, and is `nonReentrant`. `test/KarmaToken.t.sol`
  has 8 passing tests covering valid mint, invalid/replayed signatures, score updates,
  transfer/approval reverts, access control, and tier boundaries.
- **ml/** — `train_model.py` trains a logistic regression on synthetic-but-realistic
  developer feature distributions and exports `weights.json`. This is a real,
  explainable model: five features, five weights, one bias term, ~82% held-out
  accuracy on synthetic data — small enough to defend line-by-line in a judge Q&A.
- **server/** — Express + MongoDB. Fetches a GitHub profile's public activity,
  normalizes it into the model's feature space, runs inference in plain JS
  (`mlScorer.js` — no Python needed at request time), signs the result, and exposes
  a leaderboard.
- **client/** — React (Vite) + Tailwind + ethers.js. Search a GitHub username, see
  the score with a per-feature explanation, connect a wallet, mint.

## Setup

You'll need Node 18+, npm, MongoDB running locally (or an Atlas connection string),
and [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`,
`anvil`, `cast`).

```bash
curl -L https://foundry.paradigm.xyz | bash   # installs foundryup
foundryup                                      # installs forge, anvil, cast
```

### 1. Contracts (local blockchain — zero setup, best for a live demo)

```bash
forge install                    # pulls OpenZeppelin + forge-std into lib/
forge build
forge test -vv                   # 8 tests: signature checks, replay protection,
                                  # soulbound transfer/approve reverts, tiers
anvil                             # leave this running — it's your local chain,
                                  # prints 10 funded test accounts + private keys
```

In a second terminal, pick one of those printed private keys to be your **backend
signer** (do NOT use account #0 if you'll also use it as your MetaMask demo wallet —
keep the signer and the minting wallet separate so the demo clearly shows two roles).

```bash
cp server/.env.example server/.env
# paste the signer's private key into SIGNER_PRIVATE_KEY

export DEPLOYER_PRIVATE_KEY=0x...   # any other funded anvil account, for gas
export SIGNER_ADDRESS=0x...         # the address matching SIGNER_PRIVATE_KEY above

forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
# copy the printed contract address into server/.env (CONTRACT_ADDRESS)
# and into client/.env (VITE_CONTRACT_ADDRESS)
```

Point MetaMask at `http://127.0.0.1:8545`, chain ID `31337`, and import one of the
*other* printed private keys as your demo wallet (the one that will mint).

To deploy to Polygon Amoy testnet instead of the local chain, set `AMOY_RPC_URL` in
your shell and run the same `forge script` command with `--rpc-url amoy` (defined in
`foundry.toml`).

### 2. ML model (already trained — only re-run if you change features)

```bash
cd ml
pip install numpy
python3 train_model.py     # regenerates weights.json
cp weights.json ../server/services/weights.json
```

### 3. Backend

```bash
cd server
cp .env.example .env       # if you haven't already from step 1
npm install
npm run dev                 # http://localhost:5000
```

### 4. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Demo script for judges

1. Search a well-known, very active GitHub username (e.g. a prolific open-source
   maintainer) — show a high score, Gold/Platinum tier, and walk through the feature
   breakdown bars ("consistency and project depth are weighted highest — the model
   was trained to reward sustained work over vanity stats").
2. Search a brand-new or low-activity account — show a low score, contrast the
   breakdown.
3. Connect MetaMask, click "Mint karma badge on-chain." Narrate what's happening:
   backend signs the score → contract verifies the signature came from the trusted
   signer → mints a soulbound token to the connected wallet.
4. Try to transfer the token in a block explorer or via `approve()` — show the
   revert. This is the "wow" moment: reputation that literally cannot be sold or faked.
5. Refresh the leaderboard — the new mint appears with its tx hash.

## Stretch goals if you have extra hours

- Deploy to Polygon Amoy testnet instead of local Anvil for a "real" public chain.
- Add a second signed attestation type for non-GitHub contributions (Stack Overflow,
  Kaggle) and blend them into the score.
- Render the soulbound token's metadata as a dynamic on-chain SVG badge.
