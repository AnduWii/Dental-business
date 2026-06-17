# 06 · Wireframes

Low-fidelity wireframes for every page. The shipped React matches these. Clean, calm, trust-first
(it's healthcare); a single brand colour, lots of white space.

## Landing — `/`
```
┌────────────────────────────────────────────────────────────┐
│  Recall                                  Log in   [Start ▸] │
├────────────────────────────────────────────────────────────┤
│                  FOR DENTAL CLINICS                          │
│        Stop losing patients you've already paid to reach.    │
│                                                              │
│   When a call goes unanswered, Recall instantly texts the    │
│   caller back, finds out what they need, and pages your      │
│   front desk — so they book with you, not the dentist        │
│   down the road.                                             │
│                                                              │
│        [ Start your 14-day pilot ]   [ See how it works ]    │
│            Free setup · No contract · Cancel anytime         │
├────────────────────────────────────────────────────────────┤
│   ① Call goes      ② Patient gets    ③ You get the lead     │
│      unanswered        a text            (name/reason/...)   │
└────────────────────────────────────────────────────────────┘
```

## Login — `/login`
```
┌───────────────────────────────┐
│            Recall             │
│      Log in to your dashboard │
│   ┌─────────────────────────┐ │
│   │ you@clinic.com          │ │
│   └─────────────────────────┘ │
│   [  Email me a magic link  ] │
│   No password needed.         │
└───────────────────────────────┘
```

## Onboarding — `/onboarding`
```
┌───────────────────────────────────────┐
│ Recall                                 │
│ Let's set up your clinic.              │
│ Clinic name      [________________]    │
│ Your name        [________________]    │
│ Front-desk mobile[+1 647 ___ ____]     │
│   (we text this the moment a lead lands)│
│ Notification email[______________]     │
│ [        Create my dashboard         ] │
└───────────────────────────────────────┘
```

## Inbox — `/dashboard`
```
┌───────────┬──────────────────────────────────────────────────┐
│ Recall    │  Inbox                                            │
│ Bright    │  3 need attention · 5 active · 24 total           │
│ Smile     ├──────────────────────────────────────────────────┤
│           │ ┌──────────────────────────────────────────────┐ │
│ ▸ Inbox   │ │ Sarah M.            [Emergency]        2m ago │ │
│ Missed    │ │ "tooth knocked out playing hockey"           │ │
│  calls    │ │ [Needs attention] [You're replying] [new pt] │ │
│ Notif.    │ └──────────────────────────────────────────────┘ │
│ Settings  │ ┌──────────────────────────────────────────────┐ │
│           │ │ (416) 555-0190                        14m ago │ │
│           │ │ "wants to book a cleaning"                   │ │
│           │ │ [Active] [Autopilot] [new patient]           │ │
│  Sign out │ └──────────────────────────────────────────────┘ │
└───────────┴──────────────────────────────────────────────────┘
```

## Conversation — `/conversations/:id`
```
┌───────────┬─────────────────────────────────────┬───────────────┐
│ Recall    │ Sarah M.   (416) 555-0123           │ CAPTURED LEAD │
│           │ Autopilot is replying  [ Take over ]│ Name   Sarah M│
│ Inbox     ├─────────────────────────────────────┤ Phone  (416)… │
│ Missed    │            Hi, this is Bright Smile… │ Reason knocked│
│ Notif.    │ (system, 2:01pm)                    │   out tooth   │
│ Settings  │  I knocked my tooth out  ◀(patient) │ Urgency 🔴 Emer│
│           │            Call 911 / ER now — I'm   │ Intent  new pt│
│           │            alerting the clinic ▶(ai) │ Status  needs │
│           │  ...                                 │ Intake  done  │
│           ├─────────────────────────────────────┤               │
│           │ [ Type a reply…            ] [Send]  │               │
└───────────┴─────────────────────────────────────┴───────────────┘
        message bubbles: patient = left/white · ai = right/blue · staff = right/black
```

## Missed calls — `/missed-calls`
```
┌───────────┬──────────────────────────────────────────────────┐
│ ...nav... │ Missed calls                                      │
│           │ 6 today · 142 recorded.  (the proof)              │
│           ├──────────────┬───────────────┬───────────┬───────┤
│           │ Caller       │ When          │ Text-back │       │
│           ├──────────────┼───────────────┼───────────┼───────┤
│           │ Sarah M.     │ Jun 17 2:01pm │ Sent ✓    │ View  │
│           │ (416)555-0190│ Jun 17 1:47pm │ Sent ✓    │ View  │
│           │ (647)555-0114│ Jun 17 12:38pm│ Sent ✓    │ View  │
└───────────┴──────────────┴───────────────┴───────────┴───────┘
```

## Notifications — `/notifications`
```
┌───────────┬──────────────────────────────────────────────────┐
│ ...nav... │ Notifications                                     │
│           │ ┌──────────────────────────────────────────────┐ │
│           │ │ 🚨 Possible emergency        Sarah M.   2m ago│ │
│           │ │    knocked-out tooth                         │ │
│           │ ├──────────────────────────────────────────────┤ │
│           │ │ ✅ New patient lead    (416)555-0190   14m ago│ │
│           │ │    cleaning (new patient)                    │ │
│           │ ├──────────────────────────────────────────────┤ │
│           │ │ 📞 Missed call         (647)555-0114   31m ago│ │
│           │ │    Text-back sent.                           │ │
│           │ └──────────────────────────────────────────────┘ │
└───────────┴──────────────────────────────────────────────────┘
```

## Settings — `/settings`
```
┌───────────┬──────────────────────────────────────────────────┐
│ ...nav... │ Settings                                          │
│           │ ┌─ Clinic ─────────────────────────────────────┐  │
│           │ │ Name [Bright Smile Dental]  TZ [America/Tor] │  │
│           │ ├─ Phone & SMS ───────────────────────────────┤  │
│           │ │ Recall number [+1 647 555 0100]              │  │
│           │ │ Messaging Service SID [MG… optional]         │  │
│           │ ├─ Where we page you ─────────────────────────┤  │
│           │ │ Front-desk mobile [+1 647 555 1234]          │  │
│           │ │ Email [frontdesk@clinic.com]                 │  │
│           │ ├─ Conversation ──────────────────────────────┤  │
│           │ │ First text-back [textarea …{{clinic}}…]      │  │
│           │ │ [✓] Let autopilot reply & capture details    │  │
│           │ │ [ Save settings ]                            │  │
│           │ ├─ Connect your phone (one-time) ─────────────┤  │
│           │ │ Voice webhook:  https://app…/api/twilio/voice│  │
│           │ │ SMS webhook:    https://app…/api/twilio/sms  │  │
│           │ │ + enable conditional call forwarding         │  │
│           │ └──────────────────────────────────────────────┘ │
└───────────┴──────────────────────────────────────────────────┘
```
