# 01 · Product Scope, V1 / V2 / Never

Derived directly from the business document. The clinic's own words: *"No AI receptionist is
required for version one. No calendar integration is required for version one. The first version
only needs to recover missed callers and create appointment conversations. That's enough to sell."*

We hold the line on that. Scope discipline is the difference between selling in 30 days and
building forever.

## ✅ Version 1, build now (the sellable core)

These are the only things required to put it on a clinic's real number and charge $150/mo.

1. **Missed-call detection**, clinic forwards unanswered/after-hours calls to a Twilio number; the
   voice webhook records the missed call.
2. **Instant text-back**, an automatic SMS goes to the caller within seconds, from the clinic's
   Catchline number.
3. **Two-way SMS conversation**, patient replies; the thread continues.
4. **AI intake (narrow)**, a constrained assistant gathers **name, reason, urgency, booking
   intent**, then hands off. Not a receptionist.
5. **Conversation log**, every message stored and viewable.
6. **Lead capture**, the four fields persisted on the conversation.
7. **Clinic paging**, SMS to the front desk + dashboard alert when a lead lands or an emergency is
   detected.
8. **Manual takeover**, staff can jump in and reply by hand at any time; AI steps back.
9. **Missed-call log**, the *proof* artifact the entire sales motion depends on ("let's measure
   how many calls you actually missed").
10. **Clinic dashboard**, inbox, conversation view, missed calls, notifications, settings.
11. **Auth + multi-tenant isolation**, clinics log in; data is separated by Row Level Security.
12. **Customisable text-back copy + AI on/off** per clinic.

## 🕒 Version 2, deferred (only after paying clinics ask)

- **Calendar / PMS integration** (Dentrix, Open Dental, Google Calendar) and real-time slot
  booking. *The business doc explicitly flags scheduling as "still unresolved", do not block V1 on
  it.*
- **Stripe billing & self-serve signup.** First clinics are hand-onboarded and invoiced manually.
- **After-hours auto-responses / business-hours logic.**
- **Analytics dashboard** (recovery rate, revenue recovered, response times), great for renewals.
- **Team seats, roles, assignment.**
- **Voicemail capture + transcription** on the forwarded call.
- **Templated quick-replies / canned responses** for staff.
- **Multi-number / multi-location** support and DSO features.
- **Mobile push notifications / dedicated mobile app.**
- **Review-request follow-ups, recall reminders, no-show win-back** (the other revenue leaks).

## 🚫 Never build (at least not as this company)

- **A full AI receptionist that books, diagnoses, or quotes prices.** It's a liability and the doc
  says "we cannot win on technology." It also breaks the trust-through-proof positioning.
- **Medical/clinical advice in SMS.** Hard rule. Emergencies are redirected to 911/ER.
- **Replacing the clinic's phone system / number porting as the default.** Stay non-invasive: "you
  keep your number, your staff, and your workflow."
- **Spam / cold outbound texting to patients.** Inbound-triggered only; CASL/TCPA consent matters.
- **Storing clinical records or anything PHI-heavy.** Keep the data surface to contact + intent.
- **A bespoke, per-clinic custom build.** One product, configured, not an agency.

## The one-sentence test for any feature
> Does it help recover a missed caller into a booking conversation **this month**? If not, it's V2.
