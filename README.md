# 🏆 Solana Reputation Board Smart Contract

A comprehensive, gas-optimized reputation system for DAOs and guilds built on Solana using the Anchor framework.

[![Built with Anchor](https://img.shields.io/badge/Built%20with-Anchor-purple?style=for-the-badge)](https://www.anchor-lang.com/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🌟 Features

- **🗳️ Token-Gated Voting**: Only SPL token holders can vote (configurable minimum balance)
- **⏰ Cooldown System**: 24-hour cooldown per voter per target to prevent spam
- **📊 Reputation Tracking**: Persistent on-chain reputation points for all members
- **🏅 Role Unlocks**: Automatic role assignment based on reputation thresholds
- **👑 Admin Controls**: Reset scores, update thresholds, and manage the system
- **📉 Decay Mechanism**: Optional weekly 10% reputation decay to encourage ongoing participation
- **⚡ Gas Optimized**: Efficient PDA structure and minimal compute usage
- **🔒 Security First**: Comprehensive access controls and input validation

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Rust** | 1.70+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Solana CLI** | 1.17+ | `sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"` |
| **Anchor CLI** | 0.29+ | `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force` |
| **Node.js** | 18+ | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh \| bash` |
| **Yarn** | Latest | `npm install -g yarn` |

### System Requirements

- **OS**: Linux, macOS, or WSL2 on Windows
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Network**: Stable internet connection

## 🚀 Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/solana-reputation-board.git
cd solana-reputation-board
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install Node.js dependencies
yarn install

# Install Rust dependencies (handled by Anchor)
anchor build
\`\`\`

### 3. Setup Solana Environment

\`\`\`bash
# Generate a new keypair for development
solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase

# Set Solana config to localnet
solana config set --url localhost
solana config set --keypair ~/.config/solana/id.json

# Verify configuration
solana config get
\`\`\`

### 4. Start Local Validator

Open a new terminal and run:

\`\`\`bash
# Start Solana test validator (keep this running)
solana-test-validator --reset
\`\`\`

**⚠️ Important**: Keep this terminal open throughout development. The validator must be running for tests and deployment.

## 📁 Project Structure

\`\`\`
solana-reputation-board/
├── 📁 programs/
│   └── 📁 reputation-board/
│       ├── 📁 src/
│       │   └── 📄 lib.rs              # Main smart contract
│       └── 📄 Cargo.toml              # Rust dependencies
├── 📁 tests/
│   ├── 📄 reputation-board.ts         # Main test suite
│   └── 📄 utils.ts                    # Test utilities
├── 📁 target/
│   └── 📁 types/
│       └── 📄 reputation_board.ts     # Generated TypeScript types
├── 📁 scripts/
│   ├── 📄 setup.sh                    # Environment setup
│   └── 📄 run-tests.sh                # Test runner
├── 📄 Anchor.toml                     # Anchor configuration
├── 📄 Cargo.toml                      # Workspace configuration
├── 📄 package.json                    # Node.js dependencies
├── 📄 tsconfig.json                   # TypeScript configuration
└── 📄 README.md                       # This file
\`\`\`

## ⚙️ Configuration

### Anchor.toml

The main configuration file for the Anchor project:

\`\`\`toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
reputation_board = "RepBoardProgram11111111111111111111111111"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
\`\`\`

### Environment Variables

Create a `.env` file for different environments:

\`\`\`bash
# .env.local
ANCHOR_PROVIDER_URL=http://localhost:8899
ANCHOR_WALLET=~/.config/solana/id.json

# .env.devnet
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/devnet.json

# .env.mainnet
ANCHOR_PROVIDER_URL=https://api.mainnet-beta.solana.com
ANCHOR_WALLET=~/.config/solana/mainnet.json
\`\`\`

## 🧪 Running Tests

### Quick Test Run

\`\`\`bash
# Run all tests
anchor test --skip-local-validator
\`\`\`

### Detailed Test Process

\`\`\`bash
# 1. Build the program
anchor build

# 2. Run tests with verbose output
anchor test --skip-local-validator -- --reporter spec

# 3. Run specific test file
yarn ts-mocha -p ./tsconfig.json tests/reputation-board.ts

# 4. Run tests with coverage (if configured)
anchor test --skip-local-validator -- --coverage
\`\`\`

### Test Output Example

\`\`\`
  reputation-board
    ✓ Initializes the reputation board (2341ms)
    ✓ Initializes user accounts (1876ms)
    ✓ Initializes target user account (1654ms)
    ✓ Allows upvoting with sufficient token balance (2103ms)
    ✓ Prevents voting during cooldown period (987ms)
    ✓ Allows admin to reset all scores (1234ms)
    ✓ Prevents non-admin from resetting scores (876ms)
    ✓ Allows admin to update role thresholds (1456ms)
    ✓ Tests decay mechanism (654ms)

  9 passing (13.2s)
\`\`\`

### Test Coverage

The test suite covers:

- ✅ **Initialization**: Board and user account setup
- ✅ **Voting System**: Upvotes, downvotes, and token gating
- ✅ **Cooldown Mechanism**: Time-based voting restrictions
- ✅ **Role Management**: Automatic role unlocks
- ✅ **Admin Functions**: Score resets and threshold updates
- ✅ **Access Control**: Permission validation
- ✅ **Error Handling**: Invalid operations and edge cases

## 🚀 Deployment

### Local Deployment

\`\`\`bash
# Deploy to local validator
anchor deploy
\`\`\`

### Devnet Deployment

\`\`\`bash
# Switch to devnet
solana config set --url devnet

# Request devnet SOL for deployment
solana airdrop 2

# Deploy to devnet
anchor deploy --provider.cluster devnet
\`\`\`

### Mainnet Deployment

\`\`\`bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy to mainnet (requires SOL for deployment)
anchor deploy --provider.cluster mainnet-beta
\`\`\`

### Verify Deployment

\`\`\`bash
# Check program deployment
solana program show <PROGRAM_ID>

# View program logs
solana logs <PROGRAM_ID>
\`\`\`

## 💡 Usage Examples

### Initialize the Reputation Board

\`\`\`typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ReputationBoard } from "./target/types/reputation_board";

const program = anchor.workspace.ReputationBoard as Program<ReputationBoard>;

// Initialize the reputation board
const [reputationBoardPda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("reputation_board")],
  program.programId
);

await program.methods
  .initialize(
    adminPublicKey,           // Admin wallet
    tokenMintPublicKey,       // Required SPL token mint
    new anchor.BN(1000),      // Minimum token balance (1000 tokens)
    [                         // Role thresholds
      new anchor.BN(100),     // Role 1: 100 points
      new anchor.BN(500),     // Role 2: 500 points
      new anchor.BN(1000),    // Role 3: 1000 points
    ]
  )
  .accounts({
    reputationBoard: reputationBoardPda,
    payer: admin.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([admin])
  .rpc();
\`\`\`

### Cast a Vote

\`\`\`typescript
// Initialize user accounts first
await program.methods
  .initializeUser()
  .accounts({
    reputationBoard: reputationBoardPda,
    userAccount: userAccountPda,
    voterAccount: voterAccountPda,
    user: voter.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([voter])
  .rpc();

// Cast an upvote
await program.methods
  .vote(targetPublicKey, true) // true = upvote, false = downvote
  .accounts({
    reputationBoard: reputationBoardPda,
    targetAccount: targetUserAccountPda,
    voterAccount: voterAccountPda,
    voteCooldown: voteCooldownPda,
    voter: voter.publicKey,
    voterTokenAccount: voterTokenAccount,
    target: targetPublicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([voter])
  .rpc();
\`\`\`

### Query User Reputation

\`\`\`typescript
// Fetch user account data
const userAccount = await program.account.userAccount.fetch(userAccountPda);

console.log("Reputation Points:", userAccount.reputationPoints.toNumber());
console.log("Roles:", userAccount.roles);
console.log("Last Activity:", new Date(userAccount.lastActivity.toNumber() * 1000));
\`\`\`

### Admin Functions

\`\`\`typescript
// Reset all scores (admin only)
await program.methods
  .adminResetAllScores()
  .accounts({
    reputationBoard: reputationBoardPda,
    admin: admin.publicKey,
  })
  .signers([admin])
  .rpc();

// Update role thresholds (admin only)
await program.methods
  .adminSetRoleThresholds([
    new anchor.BN(50),   // New threshold for role 1
    new anchor.BN(250),  // New threshold for role 2
    new anchor.BN(750),  // New threshold for role 3
  ])
  .accounts({
    reputationBoard: reputationBoardPda,
    admin: admin.publicKey,
  })
  .signers([admin])
  .rpc();
\`\`\`

## 📚 API Reference

### Instructions

| Instruction | Description | Access |
|-------------|-------------|---------|
| `initialize` | Initialize the reputation board | Anyone |
| `initializeUser` | Create user accounts | Anyone |
| `vote` | Cast upvote/downvote | Token holders |
| `adminResetAllScores` | Reset all reputation scores | Admin only |
| `adminSetRoleThresholds` | Update role unlock thresholds | Admin only |
| `applyDecay` | Apply weekly reputation decay | Anyone |

### Account Types

| Account | Description | Size |
|---------|-------------|------|
| `ReputationBoard` | Main program state | ~200 bytes |
| `UserAccount` | Individual user reputation data | ~100 bytes |
| `VoterAccount` | Voter metadata | ~50 bytes |
| `VoteCooldown` | Per-vote cooldown tracking | ~75 bytes |

### Events

| Event | Description | Fields |
|-------|-------------|--------|
| `BoardInitialized` | Board creation | `admin`, `required_token_mint`, `min_token_balance` |
| `VoteCast` | Vote submitted | `voter`, `target`, `is_upvote`, `new_reputation` |
| `UserInitialized` | User account created | `wallet` |
| `RoleUnlocked` | New role achieved | `wallet`, `role_level`, `reputation_points` |
| `AllScoresReset` | Admin reset performed | `admin` |
| `DecayApplied` | Reputation decay applied | `timestamp`, `decay_rate` |

### Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 6000 | `InsufficientTokenBalance` | Voter doesn't have enough tokens |
| 6001 | `CooldownActive` | Voting too soon after last vote |
| 6002 | `UnauthorizedAdmin` | Non-admin trying admin function |
| 6003 | `DecayTooEarly` | Decay applied too frequently |
| 6004 | `InvalidRoleThreshold` | Invalid role threshold value |

## 🔧 Troubleshooting

### Common Issues

#### 1. Solana Test Validator Issues

**Problem**: `solana-test-validator` command not found
\`\`\`bash
# Solution: Add Solana to PATH
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
\`\`\`

**Problem**: Port 8899 already in use
\`\`\`bash
# Solution: Kill existing validator
pkill solana-test-validator
# Then restart
solana-test-validator --reset
\`\`\`

#### 2. Anchor Build Issues

**Problem**: Anchor version mismatch
\`\`\`bash
# Solution: Update Anchor
avm install latest
avm use latest
\`\`\`

**Problem**: Rust compilation errors
\`\`\`bash
# Solution: Update Rust
rustup update
# Check version
rustc --version  # Should be 1.70+
\`\`\`

#### 3. Test Failures

**Problem**: Insufficient SOL for tests
\`\`\`bash
# Solution: Increase airdrop amounts in test setup
await provider.connection.requestAirdrop(
  account.publicKey, 
  5 * anchor.web3.LAMPORTS_PER_SOL  // Increase from 2 to 5
);
\`\`\`

**Problem**: Transaction timeout
\`\`\`bash
# Solution: Increase timeout in test configuration
# In tests/reputation-board.ts
const confirmOptions = {
  commitment: "confirmed" as anchor.web3.Commitment,
  preflightCommitment: "confirmed" as anchor.web3.Commitment,
};
\`\`\`

#### 4. Deployment Issues

**Problem**: Program deployment fails
\`\`\`bash
# Solution: Check program size and increase compute budget
solana program deploy target/deploy/reputation_board.so --max-len 200000
\`\`\`

**Problem**: Insufficient SOL for deployment
\`\`\`bash
# For devnet
solana airdrop 5 --url devnet

# For mainnet, you need to purchase SOL
\`\`\`

### Debug Commands

\`\`\`bash
# Check Solana configuration
solana config get

# Check account balance
solana balance

# View program logs
solana logs <PROGRAM_ID>

# Check program account
solana program show <PROGRAM_ID>

# View transaction details
solana confirm <TRANSACTION_SIGNATURE> -v
\`\`\`

### Performance Optimization

\`\`\`bash
# Build with optimizations
anchor build --release

# Run tests with specific timeout
anchor test --skip-local-validator -- --timeout 60000

# Check program size
ls -la target/deploy/
\`\`\`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `anchor test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **Rust**: Follow `rustfmt` formatting
- **TypeScript**: Use Prettier for formatting
- **Tests**: Maintain 100% test coverage
- **Documentation**: Update README for new features

### Pull Request Process

1. Ensure all tests pass
2. Update documentation
3. Add changelog entry
4. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anchor Framework](https://www.anchor-lang.com/) - Solana development framework
- [Solana Labs](https://solana.com/) - Blockchain platform
- [SPL Token Program](https://spl.solana.com/) - Token standard

## 📞 Support

- **Documentation**: [Anchor Docs](https://www.anchor-lang.com/)
- **Discord**: [Solana Discord](https://discord.gg/solana)
- **Issues**: [GitHub Issues](https://github.com/your-username/solana-reputation-board/issues)

---


*Last updated: January 2025*
