# /test-blink — Test Action in Blinks Inspector

Run full QA on a deployed Solana Action.

## Usage

```
/test-blink <action-url>
```

Example:
```
/test-blink https://yourdomain.com/api/actions/transfer-sol
```

## Procedure

Read [skill/testing-debugging.md](../skill/testing-debugging.md) and execute:

### 1. curl smoke tests

```bash
ACTION_URL="https://yourdomain.com/api/actions/transfer-sol"

# GET
curl -s "$ACTION_URL" | jq '{title, label, disabled, error}'

# OPTIONS CORS
curl -sI -X OPTIONS "$ACTION_URL" | grep -i access-control

# POST (replace WALLET)
curl -sX POST "$ACTION_URL?amount=0.01" \
  -H "Content-Type: application/json" \
  -d '{"account":"DEVNET_WALLET"}' | jq '{type, message, transaction: .transaction[0:40]}'
```

### 2. End-to-end QA

**Recommended:** Open https://solana-actions-blinks-demo-nine.vercel.app (or your deployed demo) → Phantom on devnet → tip.

**Optional:** Blinks Inspector — https://www.blinks.xyz/inspector → paste Action URL *(often redirects to parked page)*

Check:
- [ ] Icon loads (HTTPS PNG/SVG/WebP)
- [ ] All linked buttons appear
- [ ] Parameter inputs validate
- [ ] POST returns base64 transaction
- [ ] CORS panel green

### 3. Wallet sign (devnet)

- Switch Phantom to devnet
- Sign POST transaction
- Confirm on https://explorer.solana.com/?cluster=devnet

### 4. actions.json (if using site URLs)

```bash
curl -s "https://yourdomain.com/actions.json" | jq
curl -sI -X OPTIONS "https://yourdomain.com/actions.json" | grep -i access-control
```

Inspector: paste `https://yourdomain.com/tip` (mapped path)

### 5. dial.to link

```
https://dial.to/?action=solana-action%3A<url-encoded-action-url>
```

## Report template

```markdown
## Blink Test: <name>
- GET: PASS/FAIL — <notes>
- OPTIONS CORS: PASS/FAIL
- POST: PASS/FAIL — tx length: N chars
- Inspector: PASS/FAIL
- Devnet sign: PASS/FAIL — sig: <signature>
- actions.json: PASS/FAIL/N/A
```
