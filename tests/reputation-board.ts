import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import type { ReputationBoard } from "../target/types/reputation_board"
import { expect } from "chai"
import { createMint, createAccount, mintTo } from "@solana/spl-token"
import { describe, before, it } from "mocha"

describe("reputation-board", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.ReputationBoard as Program<ReputationBoard>

  let reputationBoardPda: anchor.web3.PublicKey
  let tokenMint: anchor.web3.PublicKey
  let adminTokenAccount: anchor.web3.PublicKey
  let voterTokenAccount: anchor.web3.PublicKey
  let targetTokenAccount: anchor.web3.PublicKey

  const admin = anchor.web3.Keypair.generate()
  const voter = anchor.web3.Keypair.generate()
  const target = anchor.web3.Keypair.generate()

  const roleThresholds = [100, 500, 1000]
  const minTokenBalance = 1000

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(admin.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.requestAirdrop(voter.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.requestAirdrop(target.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)

    // Wait for airdrops to confirm
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create token mint
    tokenMint = await createMint(provider.connection, admin, admin.publicKey, null, 9)

    // Create token accounts
    adminTokenAccount = await createAccount(provider.connection, admin, tokenMint, admin.publicKey)

    voterTokenAccount = await createAccount(provider.connection, voter, tokenMint, voter.publicKey)

    targetTokenAccount = await createAccount(provider.connection, target, tokenMint, target.publicKey)

    // Mint tokens to accounts
    await mintTo(provider.connection, admin, tokenMint, adminTokenAccount, admin, 10000)

    await mintTo(provider.connection, admin, tokenMint, voterTokenAccount, admin, 5000)

    await mintTo(provider.connection, admin, tokenMint, targetTokenAccount, admin, 2000)

    // Find PDA for reputation board
    ;[reputationBoardPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reputation_board")],
      program.programId,
    )
  })

  it("Initializes the reputation board", async () => {
    await program.methods
      .initialize(
        admin.publicKey,
        tokenMint,
        new anchor.BN(minTokenBalance),
        roleThresholds.map((t) => new anchor.BN(t)),
      )
      .accounts({
        reputationBoard: reputationBoardPda,
        payer: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc()

    const boardAccount = await program.account.reputationBoard.fetch(reputationBoardPda)
    expect(boardAccount.admin.toString()).to.equal(admin.publicKey.toString())
    expect(boardAccount.requiredTokenMint.toString()).to.equal(tokenMint.toString())
    expect(boardAccount.minTokenBalance.toNumber()).to.equal(minTokenBalance)
  })

  it("Initializes user accounts", async () => {
    const [voterAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter_account"), voter.publicKey.toBuffer()],
      program.programId,
    )

    const [userAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), voter.publicKey.toBuffer()],
      program.programId,
    )

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
      .rpc()

    const userAccount = await program.account.userAccount.fetch(userAccountPda)
    expect(userAccount.wallet.toString()).to.equal(voter.publicKey.toString())
    expect(userAccount.reputationPoints.toNumber()).to.equal(0)
  })

  it("Initializes target user account", async () => {
    const [targetVoterAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter_account"), target.publicKey.toBuffer()],
      program.programId,
    )

    const [targetUserAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), target.publicKey.toBuffer()],
      program.programId,
    )

    await program.methods
      .initializeUser()
      .accounts({
        reputationBoard: reputationBoardPda,
        userAccount: targetUserAccountPda,
        voterAccount: targetVoterAccountPda,
        user: target.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([target])
      .rpc()
  })

  it("Allows upvoting with sufficient token balance", async () => {
    const [voterAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter_account"), voter.publicKey.toBuffer()],
      program.programId,
    )

    const [targetUserAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), target.publicKey.toBuffer()],
      program.programId,
    )

    const [voteCooldownPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vote_cooldown"), voter.publicKey.toBuffer(), target.publicKey.toBuffer()],
      program.programId,
    )

    await program.methods
      .vote(target.publicKey, true)
      .accounts({
        reputationBoard: reputationBoardPda,
        targetAccount: targetUserAccountPda,
        voterAccount: voterAccountPda,
        voteCooldown: voteCooldownPda,
        voter: voter.publicKey,
        voterTokenAccount: voterTokenAccount,
        target: target.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([voter])
      .rpc()

    const targetAccount = await program.account.userAccount.fetch(targetUserAccountPda)
    expect(targetAccount.reputationPoints.toNumber()).to.equal(1)
  })

  it("Prevents voting during cooldown period", async () => {
    const [voterAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter_account"), voter.publicKey.toBuffer()],
      program.programId,
    )

    const [targetUserAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), target.publicKey.toBuffer()],
      program.programId,
    )

    const [voteCooldownPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vote_cooldown"), voter.publicKey.toBuffer(), target.publicKey.toBuffer()],
      program.programId,
    )

    try {
      await program.methods
        .vote(target.publicKey, true)
        .accounts({
          reputationBoard: reputationBoardPda,
          targetAccount: targetUserAccountPda,
          voterAccount: voterAccountPda,
          voteCooldown: voteCooldownPda,
          voter: voter.publicKey,
          voterTokenAccount: voterTokenAccount,
          target: target.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc()

      expect.fail("Should have failed due to cooldown")
    } catch (error) {
      expect(error.error.errorMessage).to.include("Cooldown period is still active")
    }
  })

  it("Allows admin to reset all scores", async () => {
    await program.methods
      .adminResetAllScores()
      .accounts({
        reputationBoard: reputationBoardPda,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc()

    // Check that the reset event was emitted
    console.log("Admin reset completed successfully")
  })

  it("Prevents non-admin from resetting scores", async () => {
    try {
      await program.methods
        .adminResetAllScores()
        .accounts({
          reputationBoard: reputationBoardPda,
          admin: voter.publicKey,
        })
        .signers([voter])
        .rpc()

      expect.fail("Should have failed due to unauthorized admin")
    } catch (error) {
      expect(error.error.errorMessage).to.include("Unauthorized admin action")
    }
  })

  it("Allows admin to update role thresholds", async () => {
    const newThresholds = [50, 250, 750]

    await program.methods
      .adminSetRoleThresholds(newThresholds.map((t) => new anchor.BN(t)))
      .accounts({
        reputationBoard: reputationBoardPda,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc()

    const boardAccount = await program.account.reputationBoard.fetch(reputationBoardPda)
    expect(boardAccount.roleThresholds.map((t) => t.toNumber())).to.deep.equal(newThresholds)
  })

  it("Tests decay mechanism", async () => {
    try {
      await program.methods
        .applyDecay()
        .accounts({
          reputationBoard: reputationBoardPda,
        })
        .rpc()

      expect.fail("Should have failed due to decay too early")
    } catch (error) {
      expect(error.error.errorMessage).to.include("Decay can only be applied once per week")
    }
  })
})
