# 18 · Clinic onboarding playbook (run this when you land a client)

The exact sequence from "a dentist said yes" to "their missed calls are being recovered." Steps
are in order; do not skip the internal test (step 5) before touching their real line. Time
budget: about 30 minutes of your work, plus a 15-minute call with their front desk.

> One-time prerequisites for the FIRST paying clinic live in `CLAUDE.md` ("before your first
> paying clinic"): registered entity, insurance, counsel re-review, Supabase Pro (no auto-pause),
> billing turned on (migration 0003 + Stripe keys), domain. Do those once; this playbook is
> per-clinic.

## Step 0 · Collect these from the clinic (one email or one phone call)
- Clinic name exactly as they want patients to see it in texts.
- Front-desk mobile number (where pages go), and a notification email.
- Their real phone line's number, and **who provides it** (Bell/Rogers/Telus mobile, a landline,
  or a VoIP system like RingCentral/Ooma/8x8). This decides how call forwarding gets set up.
- Timezone if not America/Toronto.
- The name of a front-desk person who will be your contact (they get the 15-minute walkthrough).

## Step 1 · Buy their dedicated number (Twilio, ~3 min)
1. Twilio Console → Phone Numbers → Buy a number → country **Canada**, type **Local**,
   capabilities **Voice + SMS**. Pick one with their area code if available (patients trust it).
2. Complete any compliance channel prompts (Messaging and Voice), same as the first number.
3. Cost: about $1.15/month. It goes in your existing account, next to the other clinic numbers.

## Step 2 · Point the number at the app (Twilio, ~2 min)
On the new number's configuration page, set the same two webhooks every clinic uses:
- Voice, "A call comes in": Webhook, **HTTP POST**, `<app-url>/api/twilio/voice`
- Messaging, "A message comes in": Webhook, **HTTP POST**, `<app-url>/api/twilio/sms`
`<app-url>` is the production URL (today `https://dental-business-dusky.vercel.app`, later the
real domain). All numbers share the same URLs; the app routes by which number was contacted.

## Step 3 · Create their clinic in the app (~3 min)
Two ways, pick one:
- **Self-serve:** they sign up at `<app-url>/signup`, complete onboarding, and you configure the
  rest with them, or
- **You do it (the "free setup" pitch):** they sign up, then you open `/admin`, click their
  clinic, and fill it in yourself.

Either way, set in their clinic settings:
- **Catchline phone number** = the new number in E.164 (`+1XXXXXXXXXX`). This is the routing key;
  it must be exact, and only this clinic may have it.
- **Front-desk mobile** + **notification email** from step 0.
- **First text-back message**: keep the default but confirm the clinic name reads right.
- **Autopilot ON**. Save.

## Step 4 · Confirm the wiring (30 seconds)
On their settings page, the "Connect the phone" box shows the two webhook URLs. They must match
what you pasted in Twilio exactly. If they do, the plumbing is correct.

## Step 5 · Internal test, BEFORE touching their line (5 min)
From your own phone, exactly like the first-ever test:
1. **Text** the new number with a fake patient problem. Verify: AI replies, intake completes,
   the front-desk page lands on THEIR front-desk mobile (warn them it's coming), and the lead
   appears in their dashboard inbox.
2. **Call** the new number. Verify: greeting, hang-up, text-back arrives.
Do not proceed until both pass. Nothing so far has touched their real phone line.

## Step 6 · Turn on conditional call forwarding on THEIR real line (~10 min, with them)
This is the only step on the clinic's side, and it is fully reversible. "Conditional" means
answered calls never leave their office; only unanswered/busy calls forward.

By provider type:
- **Mobile line (Bell/Rogers/Telus and most Canadian carriers):** dial these on the clinic phone:
  - Forward when unanswered: `*61*` + Catchline number + `#`, then call.
  - Forward when busy: `*67*` + Catchline number + `#`, then call.
  - (To undo later: `##61#` and `##67#`.)
- **Traditional landline:** usually `*92` (busy) and `*71` or carrier-specific codes for
  no-answer forwarding; if the codes don't take, one call to their carrier's support line sets
  "busy/no-answer call forwarding" to the Catchline number.
- **VoIP system (RingCentral, Ooma, 8x8, etc.):** log into the admin portal → call handling →
  set the "when unanswered" / overflow destination to the Catchline number (often under
  "missed call" or "forwarding" rules).
Set the no-answer delay to about 4 rings (20 seconds) if the system asks.

## Step 7 · Live end-to-end test on their real line (5 min)
1. Call the clinic's REAL number from your phone. Ask the front desk to let it ring out.
2. Verify: your phone gets the text-back, the conversation runs, the front desk gets paged,
   and the lead shows in their inbox with the "forwarded from" call logged under Missed calls.
3. Have the front-desk person open the conversation and press Take over, send one reply, and
   see it arrive on your phone. That moment sells the product better than any pitch.

## Step 8 · The 15-minute front-desk walkthrough
Show them, in this order: the Inbox (where recovered patients appear), what a page text looks
like, Take over / hand back to autopilot, Missed calls, and Settings. Set expectations plainly:
the AI only gathers name, reason, urgency, and booking intent; it never gives clinical advice,
never quotes prices, and never books; a person always closes. Emergencies tell the caller to
call 911 and page the desk immediately.

## Step 9 · Pilot bookkeeping
- Note the pilot end date (14 days out) and put a reminder in your calendar.
- Check in on day 2 (is everything landing?), day 7 (show them the recovered-lead count from
  their dashboard), and day 13 (the conversion conversation: "It caught N patients this month.
  $150/month to keep it on.").
- To start billing: their dashboard → Billing → Start subscription (requires the paywall to be
  live per the CLAUDE.md checklist).

## If they ever want out
Turn off the forwarding codes (step 6's undo) and their phones are exactly as before, in under
a minute. Say this in the pitch; reversibility closes deals.

## Per-clinic cost sheet (yours)
- Number: ~$1.15/month. Inbound/outbound SMS: ~$0.008 each. Voice minute on forwards: ~$0.014.
- A busy pilot month is roughly $3 to $5 of telephony against $150/month price.

## Quick troubleshooting
- **No text-back on a missed call:** the clinic's Catchline number in Settings doesn't exactly
  match the Twilio number (E.164), or forwarding isn't actually on (call the real line and
  watch what happens), or Supabase is paused (free tier; upgrade to Pro before real clients).
- **AI replies feel scripted:** the OpenAI key is missing/out of credit; the app fell back to
  the script. Check Vercel env + platform.openai.com billing.
- **Front desk gets no page:** front-desk mobile wrong or not E.164 in Settings.
- **Everything at once is dead:** check `<app-url>` loads; if 504, Supabase is paused or down.
