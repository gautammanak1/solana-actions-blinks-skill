# /build-vote-action — Build DAO Vote Blink

Scaffold Realms governance vote Action with Yes/No/Abstain.

## Usage

```
/build-vote-action --proposal PROPOSAL_PUBKEY --governance GOVERNANCE_PUBKEY
```

## Procedure

1. Read [skill/governance-vote.md](../skill/governance-vote.md)
2. Fetch proposal metadata from Realms (on-chain or API)
3. GET: 3 linked actions OR disabled if voting closed
4. POST: validate proposal ID, check voter weight, prevent double vote
5. Build cast vote instruction via SPL Governance SDK

## Realms links

- App: https://app.realms.today/
- Get pubkeys from proposal URL in Realms UI

## Deliverable

- 3-button vote blink
- Disabled state when proposal closed
- Devnet test vote record on explorer
