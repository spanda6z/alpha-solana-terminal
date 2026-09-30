# SOLBIT — Official readiness checklist

## 1. Live data (required)

In Vercel → Project → Settings → Environment Variables (Production + Preview):

| Name | Required |
|------|----------|
| `BIRDEYE_API_KEY` | Dense Discover board |
| `HELIUS_API_KEY` | Trade tape + holders |
| `NEXT_PUBLIC_RPC_URL` | Optional custom RPC |

Redeploy after saving.

Verify: `GET /api/health` → `providers.birdeye` / `helius` = `configured`.

Discover still works via DexScreener public fallback if Birdeye is missing.

## 2. Domain

Point a custom domain (e.g. `solbit.app`) at the Vercel project. Update extension `TERMINAL` URL if you change host.

## 3. Legal

Shipped in-app:

- `/terms` — Terms of Use
- `/privacy` — Privacy Policy
- Landing disclaimer + links

Have counsel review before public marketing.

## 4. Secrets hygiene

- Never commit API keys
- Rotate keys if they were pasted in chat or screenshots
- Server-only env vars (no `NEXT_PUBLIC_` for Birdeye/Helius)

## 5. Core loop

Discover → Token desk (chart, trades, holders, risk) → Watch

Do not market bots/extension as primary until the loop is stable daily.

## 6. Honesty rules

- No fabricated trades, holders, or volume
- Show `WAITING FOR DATA` when feeds fail
- Risk is heuristic, not a scam oracle or buy signal
