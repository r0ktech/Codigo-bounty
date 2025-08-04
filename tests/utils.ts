import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import type { ReputationBoard } from "../target/types/reputation_board"

export class ReputationBoardTestUtils {
  constructor(
    public program: Program<ReputationBoard>,
    public provider: anchor.AnchorProvider,
  ) {}

  async createTestUser(): Promise<{
    keypair: anchor.web3.Keypair
    userAccountPda: anchor.web3.PublicKey
    voterAccountPda: anchor.web3.PublicKey
  }> {
    const keypair = anchor.web3.Keypair.generate()

    await this.provider.connection.requestAirdrop(keypair.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const [userAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), keypair.publicKey.toBuffer()],
      this.program.programId,
    )

    const [voterAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter_account"), keypair.publicKey.toBuffer()],
      this.program.programId,
    )

    return {
      keypair,
      userAccountPda,
      voterAccountPda,
    }
  }

  async waitForCooldown(): Promise<void> {
    // In a real test environment, you might want to use a test clock
    // For now, this is a placeholder
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  async getReputationPoints(userAccountPda: anchor.web3.PublicKey): Promise<number> {
    const userAccount = await this.program.account.userAccount.fetch(userAccountPda)
    return userAccount.reputationPoints.toNumber()
  }

  async getLeaderboard(reputationBoardPda: anchor.web3.PublicKey): Promise<any[]> {
    const boardAccount = await this.program.account.reputationBoard.fetch(reputationBoardPda)
    return boardAccount.leaderboard
  }
}
