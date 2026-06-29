# /register-dialect — Submit to Dialect Actions Registry

Register blink for X/Twitter unfurl approval.

## Usage

```
/register-dialect
```

## When needed

- Blink campaign on X/Twitter
- Trusted unfurl in social feeds
- Without registry: link shows as plain URL on X (still works on dial.to)

## Procedure

1. Deploy Action to **production HTTPS**
2. Pass [test-blink](test-blink.md) checklist
3. Apply: https://dial.to/register
4. Provide:
   - Project name + description
   - Domain + Action URLs
   - `actions.json` URL
   - Icon URL (HTTPS)
   - Team contact

## While waiting

Share via dial.to (works without registry):
```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fyourdomain.com%2Fapi%2Factions%2F...
```

## Verify registration

- Post link on X with Dialect/Phantom extension enabled
- Check unfurl shows blink UI (not plain link)

## Resources

- Registry: https://dial.to/register
- Inspector: https://www.blinks.xyz/inspector
