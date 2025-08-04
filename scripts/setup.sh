#!/bin/bash

# Create new Anchor project
anchor init reputation-board --template multiple
cd reputation-board

# Generate a new keypair for deployment
solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase

# Set Solana config to localnet
solana config set --url localhost
solana config set --keypair ~/.config/solana/id.json

# Start local validator (run in separate terminal)
echo "Starting Solana test validator..."
solana-test-validator --reset

echo "Setup complete! Run 'anchor test' to test the program."
