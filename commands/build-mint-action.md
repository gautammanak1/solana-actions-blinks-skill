# /build-mint-action — Build NFT Mint Blink

Scaffold Metaplex mint Action with on-chain supply reads.

## Usage

```
/build-mint-action [--type candy-machine|core]
```

## Procedure

1. Read [skill/nft-mint.md](../skill/nft-mint.md)
2. Gather: `COLLECTION_MINT`, `CANDY_MACHINE` (or Core collection), `MINT_PRICE_LAMPORTS`
3. Implement GET with live `remaining/total` from on-chain read
4. Implement POST with:
   - Already-minted check
   - Allowlist verify (if applicable)
   - Metaplex mint instructions
   - `createPostResponse` with partial signers if needed
5. Return `disabled: true` when sold out

## Metaplex resources

- Core: https://developers.metaplex.com/core
- Candy Machine: https://developers.metaplex.com/candy-machine

## Deliverable

- GET shows real supply from devnet CM
- POST mints on devnet
- Explorer link to minted NFT
