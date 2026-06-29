# Skill: Governance Vote Blink (Realms / SPL Governance)

DAO proposal voting via shareable Solana Action links.

Realms app: https://app.realms.today/  
SPL Governance program docs: https://github.com/Mythic-Project/solana-program-library/tree/master/governance

## When to use

- "Vote Yes/No" blink for DAO proposal on X
- Community governance without visiting Realms UI
- Multi-option proposal voting

## Env vars

```bash
REALMS_GOVERNANCE=YourGovernanceAccountPubkey
PROPOSAL_ID=YourProposalPubkey
REALMS_PROGRAM=GovER5Lthms3bLBxW7e2YvWfW2PpNq8V1A1J4K1K1K
SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

> Verify governance account + proposal pubkeys from Realms UI → proposal page URL contains them.

## GET — Yes / No / Abstain linked actions

Spec example pattern for governance:

```typescript
export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const connection = new Connection(process.env.SOLANA_RPC!);

  const proposal = new PublicKey(process.env.PROPOSAL_ID!);
  const state = await fetchProposalState(connection, proposal);

  const base = new URL("/api/actions/vote", requestUrl.origin).toString();

  if (state.status !== "Voting") {
    return Response.json({
      type: "action",
      icon: new URL("/dao-icon.png", requestUrl.origin).toString(),
      title: `Proposal: ${state.title}`,
      description: "Voting is closed for this proposal.",
      label: "Vote Closed",
      disabled: true,
      error: { message: "This proposal is no longer accepting votes." },
    } satisfies ActionGetResponse, { headers });
  }

  return Response.json({
    type: "action",
    icon: new URL("/dao-icon.png", requestUrl.origin).toString(),
    title: `Proposal: ${state.title}`,
    description: `${state.description}\n\nVoting ends: ${state.endDate}`,
    label: "Vote",
    links: {
      actions: [
        {
          type: "action",
          label: "Vote Yes",
          href: `${base}?choice=yes&proposal=${proposal.toBase58()}`,
        },
        {
          type: "action",
          label: "Vote No",
          href: `${base}?choice=no&proposal=${proposal.toBase58()}`,
        },
        {
          type: "action",
          label: "Abstain",
          href: `${base}?choice=abstain&proposal=${proposal.toBase58()}`,
        },
      ],
    },
  } satisfies ActionGetResponse, { headers });
};
```

## POST — cast vote instruction

```typescript
import { withCastVote } from "@solana/spl-governance"; // or raw instruction builder

const VALID_CHOICES = new Set(["yes", "no", "abstain"]);

export const POST = async (req: Request) => {
  const url = new URL(req.url);
  const choice = url.searchParams.get("choice");
  const proposalPubkey = url.searchParams.get("proposal");

  if (!choice || !VALID_CHOICES.has(choice)) throw "Invalid vote choice";
  if (proposalPubkey !== process.env.PROPOSAL_ID) throw "Invalid proposal";

  const body: ActionPostRequest = await req.json();
  const voter = new PublicKey(body.account);
  const connection = new Connection(process.env.SOLANA_RPC!);

  // Check voter holds governance token / NFT
  const voterWeight = await getVoterWeight(connection, voter);
  if (voterWeight === 0n) throw "No voting power";

  // Check not already voted
  if (await hasVoted(connection, voter, new PublicKey(proposalPubkey!))) {
    throw "Already voted on this proposal";
  }

  const voteRecord = getVoteRecordPDA(voter, new PublicKey(proposalPubkey!));

  const instruction = buildCastVoteInstruction({
    governance: new PublicKey(process.env.REALMS_GOVERNANCE!),
    proposal: new PublicKey(proposalPubkey!),
    tokenOwnerRecord: await getTokenOwnerRecord(connection, voter),
    voteRecord,
    voter,
    choice: choiceToEnum(choice),
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const transaction = new Transaction({ feePayer: voter, blockhash, lastValidBlockHeight })
    .add(instruction);

  const payload = await createPostResponse({
    fields: {
      transaction,
      message: `Cast ${choice.toUpperCase()} vote on proposal`,
    },
  });

  return Response.json(payload, { headers });
};
```

## Fetch proposal state (Realms)

Use Realms API or on-chain reads:

```typescript
// Realms API (community maintained)
const res = await fetch(
  `https://realms.digital/api/proposals/${proposalPubkey}`
);
```

Or read governance account directly via `@solana/spl-governance` SDK.

## actions.json

```json
{
  "rules": [
    {
      "pathPattern": "/vote/*",
      "apiPath": "https://dao.example.com/api/actions/vote"
    }
  ]
}
```

## Security

| Rule | Implementation |
|------|----------------|
| Proposal ID | Must match env `PROPOSAL_ID` — reject other proposals |
| Vote choice | Allowlist yes/no/abstain only |
| Double vote | Check vote record PDA exists |
| Voting window | Read on-chain state in POST, not just GET |
| Voter weight | Verify governance token balance > 0 |

## Spec alignment

This matches the official Actions spec governance example:
> "Vote Yes", "Vote No", "Abstain" with `disabled: true` when window closed.

## Test on devnet

1. Create test DAO on Realms devnet (or localnet)
2. Create proposal, note governance + proposal pubkeys
3. Inspector → verify 3 buttons render
4. Vote with wallet holding governance tokens
5. Confirm vote record on explorer

## Related

- SPL Governance → solana-governance-skill (if installed in kit)
- Linked actions pattern → [blink-builder.md](blink-builder.md)
