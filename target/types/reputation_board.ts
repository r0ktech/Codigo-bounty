export type ReputationBoard = {
  version: "0.1.0"
  name: "reputation_board"
  instructions: [
    {
      name: "initialize"
      accounts: [
        {
          name: "reputationBoard"
          isMut: true
          isSigner: false
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
      ]
      args: [
        {
          name: "admin"
          type: "publicKey"
        },
        {
          name: "requiredTokenMint"
          type: "publicKey"
        },
        {
          name: "minTokenBalance"
          type: "u64"
        },
        {
          name: "roleThresholds"
          type: "u64[]"
        },
      ]
    },
    {
      name: "vote"
      accounts: [
        {
          name: "reputationBoard"
          isMut: true
          isSigner: false
        },
        {
          name: "targetAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "voterAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "voter"
          isMut: true
          isSigner: true
        },
        {
          name: "voterTokenAccount"
          isMut: false
          isSigner: false
        },
        {
          name: "target"
          isMut: false
          isSigner: false
        },
      ]
      args: [
        {
          name: "target"
          type: "publicKey"
        },
        {
          name: "isUpvote"
          type: "bool"
        },
      ]
    },
    {
      name: "initializeUser"
      accounts: [
        {
          name: "reputationBoard"
          isMut: true
          isSigner: false
        },
        {
          name: "userAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "voterAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "user"
          isMut: true
          isSigner: true
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
      ]
      args: []
    },
    {
      name: "getLeaderboard"
      accounts: [
        {
          name: "reputationBoard"
          isMut: false
          isSigner: false
        },
      ]
      args: []
    },
    {
      name: "adminResetAllScores"
      accounts: [
        {
          name: "reputationBoard"
          isMut: true
          isSigner: false
        },
        {
          name: "admin"
          isMut: true
          isSigner: true
        },
      ]
      args: []
    },
    {
      name: "applyDecay"
      accounts: [
        {
          name: "reputationBoard"
          isMut: true
          isSigner: false
        },
      ]
      args: []
    },
    {
      name: "adminSetRoleThresholds"
      accounts: [
        {
          name: "reputationBoard"
          isMut: true
          isSigner: false
        },
        {
          name: "admin"
          isMut: true
          isSigner: true
        },
      ]
      args: [
        {
          name: "newThresholds"
          type: "u64[]"
        },
      ]
    },
  ]
  accounts: [
    {
      name: "ReputationBoard"
      type: {
        kind: "struct"
        fields: [
          {
            name: "admin"
            type: "publicKey"
          },
          {
            name: "requiredTokenMint"
            type: "publicKey"
          },
          {
            name: "minTokenBalance"
            type: "u64"
          },
          {
            name: "roleThresholds"
            type: "u64[]"
          },
          {
            name: "lastDecayTimestamp"
            type: "i64"
          },
          {
            name: "totalMembers"
            type: "u64"
          },
          {
            name: "leaderboard"
            type: {
              vec: {
                defined: "LeaderboardEntry"
              }
            }
          },
        ]
      }
    },
    {
      name: "UserAccount"
      type: {
        kind: "struct"
        fields: [
          {
            name: "wallet"
            type: "publicKey"
          },
          {
            name: "reputationPoints"
            type: "u64"
          },
          {
            name: "roles"
            type: "u8[]"
          },
          {
            name: "lastActivity"
            type: "i64"
          },
        ]
      }
    },
    {
      name: "VoterAccount"
      type: {
        kind: "struct"
        fields: [
          {
            name: "wallet"
            type: "publicKey"
          },
          {
            name: "cooldowns"
            type: {
              btreeMap: {
                key: "string"
                value: "i64"
              }
            }
          },
        ]
      }
    },
  ]
  types: [
    {
      name: "LeaderboardEntry"
      type: {
        kind: "struct"
        fields: [
          {
            name: "wallet"
            type: "publicKey"
          },
          {
            name: "reputationPoints"
            type: "u64"
          },
        ]
      }
    },
  ]
  events: [
    {
      name: "BoardInitialized"
      fields: [
        {
          name: "admin"
          type: "publicKey"
          index: false
        },
        {
          name: "requiredTokenMint"
          type: "publicKey"
          index: false
        },
        {
          name: "minTokenBalance"
          type: "u64"
          index: false
        },
      ]
    },
    {
      name: "VoteCast"
      fields: [
        {
          name: "voter"
          type: "publicKey"
          index: false
        },
        {
          name: "target"
          type: "publicKey"
          index: false
        },
        {
          name: "isUpvote"
          type: "bool"
          index: false
        },
        {
          name: "newReputation"
          type: "u64"
          index: false
        },
      ]
    },
    {
      name: "UserInitialized"
      fields: [
        {
          name: "wallet"
          type: "publicKey"
          index: false
        },
      ]
    },
    {
      name: "RoleUnlocked"
      fields: [
        {
          name: "wallet"
          type: "publicKey"
          index: false
        },
        {
          name: "roleLevel"
          type: "u8"
          index: false
        },
        {
          name: "reputationPoints"
          type: "u64"
          index: false
        },
      ]
    },
    {
      name: "AllScoresReset"
      fields: [
        {
          name: "admin"
          type: "publicKey"
          index: false
        },
      ]
    },
    {
      name: "DecayApplied"
      fields: [
        {
          name: "timestamp"
          type: "i64"
          index: false
        },
        {
          name: "decayRate"
          type: "u16"
          index: false
        },
      ]
    },
    {
      name: "RoleThresholdsUpdated"
      fields: [
        {
          name: "admin"
          type: "publicKey"
          index: false
        },
      ]
    },
  ]
  errors: [
    {
      code: 6000
      name: "InsufficientTokenBalance"
      msg: "Insufficient token balance to vote"
    },
    {
      code: 6001
      name: "CooldownActive"
      msg: "Cooldown period is still active"
    },
    {
      code: 6002
      name: "UnauthorizedAdmin"
      msg: "Unauthorized admin action"
    },
    {
      code: 6003
      name: "DecayTooEarly"
      msg: "Decay can only be applied once per week"
    },
    {
      code: 6004
      name: "InvalidRoleThreshold"
      msg: "Invalid role threshold"
    },
  ]
}

export const IDL: ReputationBoard = {
  version: "0.1.0",
  name: "reputation_board",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "reputationBoard",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "admin",
          type: "publicKey",
        },
        {
          name: "requiredTokenMint",
          type: "publicKey",
        },
        {
          name: "minTokenBalance",
          type: "u64",
        },
        {
          name: "roleThresholds",
          type: "u64[]",
        },
      ],
    },
    {
      name: "vote",
      accounts: [
        {
          name: "reputationBoard",
          isMut: true,
          isSigner: false,
        },
        {
          name: "targetAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voterAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voter",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voterTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "target",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "target",
          type: "publicKey",
        },
        {
          name: "isUpvote",
          type: "bool",
        },
      ],
    },
    {
      name: "initializeUser",
      accounts: [
        {
          name: "reputationBoard",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voterAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "getLeaderboard",
      accounts: [
        {
          name: "reputationBoard",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "adminResetAllScores",
      accounts: [
        {
          name: "reputationBoard",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "applyDecay",
      accounts: [
        {
          name: "reputationBoard",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "adminSetRoleThresholds",
      accounts: [
        {
          name: "reputationBoard",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "newThresholds",
          type: "u64[]",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "ReputationBoard",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "requiredTokenMint",
            type: "publicKey",
          },
          {
            name: "minTokenBalance",
            type: "u64",
          },
          {
            name: "roleThresholds",
            type: "u64[]",
          },
          {
            name: "lastDecayTimestamp",
            type: "i64",
          },
          {
            name: "totalMembers",
            type: "u64",
          },
          {
            name: "leaderboard",
            type: {
              vec: {
                defined: "LeaderboardEntry",
              },
            },
          },
        ],
      },
    },
    {
      name: "UserAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "wallet",
            type: "publicKey",
          },
          {
            name: "reputationPoints",
            type: "u64",
          },
          {
            name: "roles",
            type: "u8[]",
          },
          {
            name: "lastActivity",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "VoterAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "wallet",
            type: "publicKey",
          },
          {
            name: "cooldowns",
            type: {
              btreeMap: {
                key: "string",
                value: "i64",
              },
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "LeaderboardEntry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "wallet",
            type: "publicKey",
          },
          {
            name: "reputationPoints",
            type: "u64",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "BoardInitialized",
      fields: [
        {
          name: "admin",
          type: "publicKey",
          index: false,
        },
        {
          name: "requiredTokenMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "minTokenBalance",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "VoteCast",
      fields: [
        {
          name: "voter",
          type: "publicKey",
          index: false,
        },
        {
          name: "target",
          type: "publicKey",
          index: false,
        },
        {
          name: "isUpvote",
          type: "bool",
          index: false,
        },
        {
          name: "newReputation",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "UserInitialized",
      fields: [
        {
          name: "wallet",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "RoleUnlocked",
      fields: [
        {
          name: "wallet",
          type: "publicKey",
          index: false,
        },
        {
          name: "roleLevel",
          type: "u8",
          index: false,
        },
        {
          name: "reputationPoints",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "AllScoresReset",
      fields: [
        {
          name: "admin",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "DecayApplied",
      fields: [
        {
          name: "timestamp",
          type: "i64",
          index: false,
        },
        {
          name: "decayRate",
          type: "u16",
          index: false,
        },
      ],
    },
    {
      name: "RoleThresholdsUpdated",
      fields: [
        {
          name: "admin",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InsufficientTokenBalance",
      msg: "Insufficient token balance to vote",
    },
    {
      code: 6001,
      name: "CooldownActive",
      msg: "Cooldown period is still active",
    },
    {
      code: 6002,
      name: "UnauthorizedAdmin",
      msg: "Unauthorized admin action",
    },
    {
      code: 6003,
      name: "DecayTooEarly",
      msg: "Decay can only be applied once per week",
    },
    {
      code: 6004,
      name: "InvalidRoleThreshold",
      msg: "Invalid role threshold",
    },
  ],
}
