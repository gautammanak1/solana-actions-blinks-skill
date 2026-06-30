# Testing, Debugging & Shipping Blinks

## Primary QA (recommended)

**Live demo with embedded blink client:** [https://solana-actions-blinks-demo-nine.vercel.app](https://solana-actions-blinks-demo-nine.vercel.app)

Works without dial.to or Blinks Inspector (both third-party tools are often down). Connect Phantom on **devnet** → tip → confirm on explorer.

For your own deployment, replicate the same flow: GET metadata renders buttons → POST returns base64 tx → wallet signs.

## Blinks Inspector

URL: [https://www.blinks.xyz/inspector](https://www.blinks.xyz/inspector)

Use Inspector to:
- Paste Action URL or site URL (with actions.json)
- View GET response payload + headers
- Simulate POST with a test wallet pubkey
- Verify CORS / OPTIONS preflight
- Debug parameter forms and linked actions

### Inspector workflow

```
1. Deploy Action endpoint (devnet first)
2. Open Inspector
3. Paste: https://yourdomain.com/api/actions/tip
   OR: https://yourdomain.com/tip (if actions.json mapped)
4. Verify GET metadata renders (icon, title, buttons)
5. Enter devnet wallet pubkey → test POST
6. Confirm base64 transaction decodes correctly
7. Sign with Phantom (devnet) → confirm on explorer
```

Fix all Inspector errors before mainnet.

## devnet testing checklist

```bash
# 1. Fund devnet wallet
solana airdrop 2 <YOUR_DEVNET_WALLET> --url devnet

# 2. Set env
RPC_URL=https://api.devnet.solana.com
TREASURY=<devnet treasury pubkey>

# 3. curl GET
curl -s https://yourdomain.com/api/actions/tip | jq

# 4. curl OPTIONS (CORS)
curl -s -X OPTIONS -I https://yourdomain.com/api/actions/tip | grep -i access-control

# 5. curl POST
curl -s -X POST https://yourdomain.com/api/actions/tip \
  -H "Content-Type: application/json" \
  -d '{"account":"<DEVNET_PUBKEY>"}' | jq
```

## dial.to interstitial

Universal blink renderer: [https://dial.to](https://dial.to)

Share format:
```
https://dial.to/?action=solana-action%3A<encoded-action-url>
```

Works even before Dialect registry approval — best for demos and QA.

Generate encoded URL:
```javascript
const actionUrl = "https://api.myapp.com/actions/tip";
const blink = `https://dial.to/?action=${encodeURIComponent("solana-action:" + actionUrl)}`;
```

## Dialect Actions Registry

For **X/Twitter unfurl** (trusted blink preview in feed):

1. Build and test Action on devnet/mainnet
2. Apply: [https://dial.to/register](https://dial.to/register)
3. Provide: domain, Action URLs, project info
4. Wait for verification

Without registry:
- Blinks still work on dial.to, Phantom, Dialect extension
- X may show plain URL without interactive blink

## Wallet testing matrix

| Client | Test |
|--------|------|
| Phantom (devnet) | Sign POST transaction |
| Backpack | GET unfurl + sign |
| Dialect extension | Blink on test page |
| dial.to | Full interstitial flow |
| Blinks Inspector | API-level debug |

Switch wallet to **devnet** before signing test transactions.

## Common Inspector errors

| Error | Fix |
|-------|-----|
| CORS preflight failed | Add OPTIONS handler + ACTIONS_CORS_HEADERS |
| Invalid icon URL | Must be absolute HTTPS; PNG/SVG/WebP |
| Malformed action URL | Must be HTTPS; check encoding |
| POST 400 | Validate account parsing; log server error |
| Transaction simulate fail | Wrong blockhash, insufficient SOL, bad accounts |
| actions.json not found | Deploy to domain root; check path |

## Mainnet promotion checklist

```
[ ] All Inspector tests pass on production URL
[ ] Security checklist complete (callback-security.md)
[ ] Rate limiting enabled on POST
[ ] RPC provider handles expected traffic
[ ] Icon + branding finalized
[ ] actions.json rules match marketing URLs
[ ] Dialect registry submitted (if X campaign planned)
[ ] Fallback website works for non-blink browsers
[ ] Monitoring/alerts configured
```

## Video & tutorial resources

- [Build a Solana Action (video)](https://www.youtube.com/watch?v=kCht01Ycif0)
- [transfer-sol source](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts)

## Community examples

Browse [Awesome Blinks](https://github.com/solana-developers/awesome-blinks) for:
- Real-world blink patterns
- Idea discussions
- Inspiration (don't copy — differentiate)

## Debugging POST transaction failures

After user signs but tx fails on-chain:

1. Simulate tx in Inspector or `@solana/web3.js` `simulateTransaction`
2. Check explorer error logs
3. Common causes:
   - Blockhash expired (user waited too long)
   - Insufficient SOL for fee + transfer
   - Account not initialized (ATA missing)
   - Program constraint failure

Return clearer `message` in POST response when simulation fails server-side **before** returning tx.

```typescript
const simulation = await connection.simulateTransaction(tx);
if (simulation.value.err) {
  return Response.json(
    { message: "Transaction would fail: insufficient SOL" },
    { status: 400, headers: ACTIONS_CORS_HEADERS }
  );
}
```

## Agent deliverable: test report template

When completing an Action implementation, include:

```markdown
## Blink Test Report
- Action URL: ...
- dial.to link: ...
- Inspector GET: PASS/FAIL
- Inspector POST: PASS/FAIL
- Devnet tx signature: ...
- actions.json: PASS/FAIL
- Registry status: submitted / not needed
```
