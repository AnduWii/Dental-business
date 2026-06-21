# Catchline - Data Processing Agreement (DPA)

> Plain-text copy of the live page at `/dpa`, provided for legal review.
> Last updated June 21, 2026.
> Template: complete the bracketed fields and have it reviewed by counsel before signing.

This agreement sets out how Catchline handles information on behalf of the dental clinics it serves: our roles, the security we apply, who our sub-processors are, where data lives, how we handle breaches, and how data is deleted.

## About this agreement
This Data Processing Agreement (DPA) forms part of the service agreement between the clinic (the customer) and Catchline. It describes how Catchline handles personal information and personal health information on behalf of the Clinic when providing the Catchline missed-call recovery service (the Service).

## 1. Definitions
- Applicable Privacy Laws: Canada's PIPEDA, Ontario's PHIPA, and CASL, plus any other privacy or anti-spam laws that apply to the Clinic.
- Personal Information and Personal Health Information: information about an identifiable individual (including health information) that Catchline processes for the Clinic under the Service.
- Processing: any operation performed on the information, such as collecting, storing, using, transmitting, or deleting it.
- Sub-processor: a third party Catchline engages to help provide the Service that may process the information.

## 2. Roles of the parties
The Clinic is the party responsible for the information and is the health information custodian under PHIPA (the controller). Catchline acts only as the Clinic's service provider and agent (the processor): we process the information solely to provide the Service and only on the Clinic's documented instructions, including those given through the dashboard settings.

Catchline will not use the information for its own purposes, will not sell it, and will not use the content of patient messages to train AI models. Catchline uses AI only for administrative intake and communication; it does not use AI to give medical or dental advice, to diagnose, to recommend or decide on treatment, or to make clinical judgments.

The Clinic is responsible for having the legal right, and any consent required, to contact the individuals it responds to through the Service, including compliance with CASL.

## 3. Scope, nature, and purpose of processing
- Purpose: recover missed calls by texting callers back, running a short intake, logging conversations, and paging the Clinic's front desk.
- Duration: for the term of the service agreement and the retention period in Section 8.
- Types of data: caller phone number and name, the reason for contact and message content (which may include health information), urgency and booking intent, call records, and clinic staff login details.
- Categories of individuals: the Clinic's callers and patients, and the Clinic's staff users.

## 4. Catchline's obligations
- Process the information only to provide the Service and only on the Clinic's instructions.
- Keep the information confidential and ensure personnel are bound by confidentiality.
- Maintain the security measures described in Annex C and keep them appropriate to the sensitivity of the data.
- Assist the Clinic in responding to individuals' access, correction, and deletion requests.
- Notify the Clinic of a security breach affecting the information within the timeframe in Section 9.
- Help the Clinic meet its obligations under Applicable Privacy Laws, taking into account the nature of the processing.

## 5. Sub-processors
The Clinic authorises Catchline to engage the sub-processors listed in Annex B. Catchline imposes data-protection obligations on each sub-processor that are consistent with this DPA, and remains responsible for their performance. Catchline will give the Clinic notice of any new sub-processor, and the Clinic may object on reasonable data-protection grounds.

## 6. Data location and cross-border transfer
Catchline's primary database is hosted in Canada (Montreal region). Certain sub-processors, notably the telephony and AI providers, may process limited data such as phone numbers and message text in the United States to deliver messages and generate replies. The Clinic acknowledges and instructs these transfers, which are made subject to appropriate safeguards.

## 7. Assisting with individual requests
Catchline provides tools and reasonable assistance so the Clinic can fulfil requests from individuals to access, correct, or delete their information, and to honour opt-outs (callers may reply STOP at any time, which Catchline enforces automatically).

## 8. Retention, return, and deletion
Catchline retains information only as long as needed to provide the Service. By default, closed conversations are purged after approximately 12 months, and the Clinic may request a different retention period or earlier deletion. On termination, Catchline will, at the Clinic's choice, return or delete the Clinic's information within a reasonable period, except where retention is required by law.

## 9. Breach notification
If Catchline becomes aware of a breach of security safeguards involving the information, it will notify the Clinic without undue delay and in any event no later than 72 hours after discovery, and will provide the information the Clinic reasonably needs to assess the breach and meet its own notification obligations under PHIPA and PIPEDA.

## 10. Audits and information rights
On reasonable written request, Catchline will make available the information necessary to demonstrate compliance with this DPA, and will cooperate with reasonable audits, subject to confidentiality and to not compromising the security of other customers.

## 11. Term, termination, and survival
This DPA applies for as long as Catchline processes the information for the Clinic. Obligations that by their nature should survive termination, including confidentiality and deletion, continue after it ends.

## 12. Governing law
This DPA is governed by the laws of the Province of Ontario and the federal laws of Canada applicable there, unless the parties agree otherwise in the service agreement. [Confirm with counsel.]

## Annex A. Details of processing
| Item | Detail |
|---|---|
| Subject matter | Missed-call recovery and SMS intake for the Clinic. |
| Duration | Term of the service agreement plus the retention period in Section 8. |
| Nature and purpose | Text-back, two-way SMS, narrow AI intake, logging, and front-desk paging. |
| Types of data | Phone number, name, reason and message content (may include health information), urgency, booking intent, call records, staff login. |
| Categories of individuals | Callers, patients, and clinic staff users. |

## Annex B. Approved sub-processors
| Sub-processor | Purpose and location |
|---|---|
| Supabase | Database and authentication, hosted in Canada (Montreal). |
| Vercel | Application hosting. |
| Twilio | Calls and SMS; may process data in the United States. |
| OpenAI and Anthropic | Generating intake replies from message text, in the United States. |
| Resend (if email enabled) | Notification emails. |

## Annex C. Security measures
- Encryption in transit (HTTPS/TLS) across the website, dashboard, and webhooks.
- Multi-tenant isolation enforced at the database level so one clinic cannot access another's data.
- Role-based access control and least-privilege handling of data and secrets; the privileged database key is server-side only.
- Append-only audit log of sensitive actions (replies, takeovers, settings changes) that cannot be altered or deleted.
- A documented breach-response process, incident logging, regular database backups with a defined retention and purge schedule, and review of sub-processors before they are engaged.
- Validation and signature verification on incoming calls and messages; retries with idempotency to prevent duplicates.
- Dependency scanning and security headers, with patches applied as advisories arise.

Catchline maintains an internal information-security policy covering access control, employee access, breach response, backups, retention, incident logging, and vendor review, available to the Clinic on reasonable request.

## Signatures
- Clinic: [Clinic legal name]. Signed by [name], [title]. Date: [ ].
- Catchline: Catchline Services Inc. Signed by Andrew Li, Founder. Date: [ ].

Contact: founders@trycatchline.com
