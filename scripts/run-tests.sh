#!/bin/bash

echo "🚀 Starting Solana Reputation Board Tests..."

# Check if solana-test-validator is running
if ! pgrep -f "solana-test-validator" > /dev/null; then
    echo "❌ Solana test validator is not running!"
    echo "Please run: solana-test-validator --reset"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the program
echo "🔨 Building program..."
anchor build

# Run tests
echo "🧪 Running tests..."
anchor test --skip-local-validator

echo "✅ Tests completed!"
