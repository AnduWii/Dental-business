# 08 · Twilio Setup, call forwarding, detection & compliance

This is the part with real-world friction. The code is easy; the telephony and compliance need
care. Read this before onboarding a clinic.

## How missed-call detection actually works

We do **not** replace the clinic's phone system. The clinic keeps its number, staff, and workflow.
Instead, the clinic's carrier **forwards unanswered calls** to a Twilio number we provision for
them:

```
Patient ──▶ Clinic's real line ──(rings, no answer / busy)──▶ forwards ──▶ Twilio number ──▶ /api/twilio/voice
```

When the forwarded call reaches Twilio, our voice webhook fires, we log the missed call and text the
caller back. From then on, the conversation lives on the Twilio number (that's the "text line").

### Setting up conditional call forwarding
Most carriers and VoIP systems support "forward on no-answer" and "forward on busy":

- **Traditional carrier (GSM-style codes):**
  - Forward when unanswered: dial `*61*<TwilioNumber>#`
  - Forward when busy: dial `*67*<TwilioNumber>#`
  - Forward when unreachable: dial `*62*<TwilioNumber>#`
  - (Codes vary by carrier, confirm with the clinic's provider.)
- **VoIP / PBX (RingCentral, 8x8, Ooma, etc.):** set "forward after N rings / when busy" to the
  Twilio number in the admin panel.

Tune the ring count so staff get a fair chance to answer first (e.g. forward after 4 rings).

> Note on caller ID: with carrier forwarding, Twilio receives `From` = the original caller (the
> patient) and `To` = the Twilio number; the clinic's forwarding line appears as `ForwardedFrom`.
> The webhook uses `From` as the patient. Verify this with your specific carrier during setup.

## Configure the Twilio number's webhooks

In the Twilio Console → Phone Numbers → your number:

| Setting | Value |
|---|---|
| **Voice, A Call Comes In** | Webhook · HTTP **POST** · `https://YOUR_APP/api/twilio/voice` |
| **Messaging, A Message Comes In** | Webhook · HTTP **POST** · `https://YOUR_APP/api/twilio/sms` |

The exact URLs are shown for you on the **Settings** page once the app is deployed. `YOUR_APP` must
match `NEXT_PUBLIC_APP_URL` exactly, the app validates Twilio's request signature against it.

## A2P 10DLC registration (US), start early
To send application-to-person SMS to US numbers you must register a Brand + Campaign (A2P 10DLC).
- Submit it in **Week 4, early**, approval can take a few days.
- Use a **Messaging Service** and put its SID in Settings (`twilio_messaging_service_sid`); the app
  prefers it for sending.
- For Canadian numbers, registration requirements differ but plan similar lead time.

## CASL / TCPA compliance (Canada / US)
- **Implied consent:** the patient *called the clinic first*, so the immediate service text-back is
  a response to their inquiry, the right footing for compliance. Keep messaging service-related,
  not promotional.
- **Opt-out is mandatory and automatic:** Twilio handles STOP/UNSUBSCRIBE/HELP keywords. The app
  also marks the patient `opted_out` and **never texts them again** (the dashboard composer is
  disabled for them). START re-subscribes.
- **Identify the sender:** the first text names the clinic.
- Keep records: every message is logged in `messages`, every missed call in `call_events`.

## Local testing without a real clinic line
1. `npm run dev`, then `npx ngrok http 3000`.
2. Set `NEXT_PUBLIC_APP_URL` to the ngrok URL and point the Twilio webhooks at it.
3. Call your Twilio number directly (simulates a forwarded call) and don't answer → you should get
   the text-back. Reply to it to drive the intake.
4. Watch rows appear in Supabase and the dashboard update live.

## Cost per clinic (rule of thumb)
- Number: ~$1.15/mo
- Voice (short forwarded leg): ~$0.0085/min
- SMS: ~$0.0079 per segment each way
- A busy pilot clinic is still only a few dollars a month, comfortably inside the $150 price.
