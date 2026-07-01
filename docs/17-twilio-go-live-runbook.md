# 17 · Twilio go-live runbook (self-test)

The fully planned path to a working end-to-end test, with every known gotcha pre-answered. Order
matters: the pre-flight checks are what make the test actually work. Do them first.

## Decisions already made (so they don't resurface)
- **Account type:** Individual (the company is not registered yet). Switch to Business later.
- **Starting balance:** $20, auto-recharge OFF (no surprise charges during testing).
- **Number country:** try **Canadian** first (you serve Ontario clinics; a Canadian number looks
  local to patients and avoids US A2P 10DLC). US local is only a disposable fallback if Canada is
  blocked.
- **AI key:** optional. Without `OPENAI_API_KEY` the intake still works but replies are the
  deterministic scripted flow, not the smart LLM ones. Expect scripted replies unless you add the key.

## Pre-flight (if any of these is wrong, the test fails silently)
1. **Vercel must be live, not paused.** Your account was paused earlier when `stockanalyzer` blew
   the free CPU limit. Open your live site in a browser. If it loads, you are un-paused. If it does
   not, resolve that first (wait for the monthly reset, delete stockanalyzer, or upgrade). A paused
   deployment means Twilio's webhooks hit a dead app and nothing happens.
2. **Know your stable app URL.** Vercel, your project, Settings, Domains. Use the clean production
   domain (no random deployment hash). Not the old `dental-business-dusky` one.
3. **Set `NEXT_PUBLIC_APP_URL` to that exact URL** (Vercel env vars) and redeploy. The app validates
   Twilio's signature against this value, so it must equal the URL Twilio actually calls, exactly:
   same scheme, same host, no trailing slash.
4. **You can sign in and a clinic record exists.** If not, sign up one at `/signup` first.

## Step 1, buy the number
- Number search, set country to **Canada**, type **Local**, capabilities **Voice + SMS**.
- If it asks for a **regulatory bundle**, complete it with your Ontario address (your approved
  Individual customer profile should carry most of it). There can be a short review.
- Canadian numbers do not need US A2P 10DLC, so no "registration required" SMS wall for texting
  Canadian patients.
- **Fallback:** if Canada is still blocked, buy a **US Local** number (about $1.15, disposable) just
  to test, and swap to Canadian for production. Note: US to your Canadian cell may not deliver SMS
  while unregistered.

## Step 2, credentials and redeploy
- Twilio console home, Account Info: copy **Account SID** and **Auth Token**.
- Vercel env vars: add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` (the app URL was fixed in
  pre-flight).
- **Redeploy.** Env changes do not take effect until you do.

## Step 3, configure the clinic
- Sign in as admin, `/admin`, open your clinic.
- Set **Catchline phone number** = your new number in E.164 (for example `+16592475792`), **must
  match exactly** what Twilio sends. **Front-desk mobile** = your cell. **AI autopilot ON.** Save.
- Scroll to "Connect the phone"; it shows the exact **Voice** and **Message** webhook URLs. Copy them.

## Step 4, set the webhooks
- Twilio, Phone Numbers, Manage, your number.
- **Voice, "A call comes in"** = Webhook, **HTTP POST**, paste the voice URL.
- **Messaging, "A message comes in"** = Webhook, **HTTP POST**, paste the message URL.
- Save. (POST, not GET. This is a common mistake.)

## Step 5, test and what to expect
- **Text test:** from your cell, text the number ("I cracked a molar and it really hurts"). Expect a
  reply within seconds (scripted unless you added the AI key). Answer a couple of times. A
  front-desk page arrives.
- **Call test:** call the number, hear the greeting, it hangs up, the text-back arrives, reply to
  continue.
- **Verify:** `/dashboard` and the conversation show the captured name, reason, urgency, and booking
  intent.
- **Solo-test note:** your cell is both the caller and the front desk, so you receive both the reply
  and the page on one phone. That is expected, not a bug.

## Troubleshooting matrix (failure, cause)
- Webhook returns 403: `NEXT_PUBLIC_APP_URL` does not equal the URL Twilio calls, or you used GET
  instead of POST.
- Nothing happens on a call or text: the clinic's Catchline number does not exactly equal the number
  you contacted, or env vars were added but not redeployed.
- Calls work but texts never arrive: US number to a Canadian cell while unregistered, or Twilio
  Messaging Geographic Permissions does not include Canada.
- Replies look basic: no `OPENAI_API_KEY`, so the scripted fallback is running (fine for a test).
- You stop getting replies: you texted STOP at some point and opted the patient out.

## Not needed for the self-test (production only)
- Conditional call forwarding on a real clinic line: for the test you just call the Twilio number
  directly, which hits the same webhook.
- A2P 10DLC (only for texting US numbers) and, eventually, the Business account and a Canadian
  number owned by Catchline Services Inc.
