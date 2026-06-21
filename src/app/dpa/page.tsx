import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: `Data Processing Agreement — ${BRAND.name}`,
  description:
    "The data-processing terms between Catchline and the dental clinics it serves, covering roles, security, sub-processors, residency, breach notice, and deletion.",
};

const UPDATED = "June 21, 2026";

const sections: LegalSection[] = [
  {
    heading: "About this agreement",
    blocks: [
      {
        type: "note",
        text: "Template — complete the bracketed fields and have it reviewed by counsel before signing. This Data Processing Agreement (DPA) forms part of the service agreement between the clinic (the customer) and Catchline.",
      },
      {
        type: "p",
        text: "This DPA describes how Catchline handles personal information and personal health information on behalf of the Clinic when providing the Catchline missed-call recovery service (the Service).",
      },
    ],
  },
  {
    heading: "1. Definitions",
    blocks: [
      {
        type: "ul",
        items: [
          "Applicable Privacy Laws: Canada's PIPEDA, Ontario's PHIPA, and CASL, plus any other privacy or anti-spam laws that apply to the Clinic.",
          "Personal Information / Personal Health Information: information about an identifiable individual (including health information) that Catchline processes for the Clinic under the Service.",
          "Processing: any operation performed on the information, such as collecting, storing, using, transmitting, or deleting it.",
          "Sub-processor: a third party Catchline engages to help provide the Service that may process the information.",
        ],
      },
    ],
  },
  {
    heading: "2. Roles of the parties",
    blocks: [
      {
        type: "p",
        text: "The Clinic is the party responsible for the information and is the health information custodian under PHIPA (the controller). Catchline acts only as the Clinic's service provider and agent (the processor): we process the information solely to provide the Service and only on the Clinic's documented instructions, including those given through the dashboard settings.",
      },
      {
        type: "p",
        text: "Catchline will not use the information for its own purposes, will not sell it, and will not use the content of patient messages to train AI models.",
      },
    ],
  },
  {
    heading: "3. Scope, nature, and purpose of processing",
    blocks: [
      {
        type: "ul",
        items: [
          "Purpose: recover missed calls by texting callers back, running a short intake, logging conversations, and paging the Clinic's front desk.",
          "Duration: for the term of the service agreement and the retention period in Section 8.",
          "Types of data: caller phone number and name, the reason for contact and message content (which may include health information), urgency and booking intent, call records, and clinic staff login details.",
          "Categories of individuals: the Clinic's callers and patients, and the Clinic's staff users.",
        ],
      },
    ],
  },
  {
    heading: "4. Catchline's obligations",
    blocks: [
      {
        type: "ul",
        items: [
          "Process the information only to provide the Service and only on the Clinic's instructions.",
          "Keep the information confidential and ensure personnel are bound by confidentiality.",
          "Maintain the security measures described in Annex C and keep them appropriate to the sensitivity of the data.",
          "Assist the Clinic in responding to individuals' access, correction, and deletion requests.",
          "Notify the Clinic without undue delay after becoming aware of a security breach affecting the information.",
          "Help the Clinic meet its obligations under Applicable Privacy Laws, taking into account the nature of the processing.",
        ],
      },
    ],
  },
  {
    heading: "5. Sub-processors",
    blocks: [
      {
        type: "p",
        text: "The Clinic authorises Catchline to engage the sub-processors listed in Annex B. Catchline imposes data-protection obligations on each sub-processor that are consistent with this DPA, and remains responsible for their performance. Catchline will give the Clinic notice of any new sub-processor, and the Clinic may object on reasonable data-protection grounds.",
      },
    ],
  },
  {
    heading: "6. Data location and cross-border transfer",
    blocks: [
      {
        type: "p",
        text: "Catchline's primary database is hosted in Canada (Montreal region). Certain sub-processors — notably the telephony and AI providers — may process limited data such as phone numbers and message text in the United States to deliver messages and generate replies. The Clinic acknowledges and instructs these transfers, which are made subject to appropriate safeguards.",
      },
    ],
  },
  {
    heading: "7. Assisting with individual requests",
    blocks: [
      {
        type: "p",
        text: "Catchline provides tools and reasonable assistance so the Clinic can fulfil requests from individuals to access, correct, or delete their information, and to honour opt-outs (callers may reply STOP at any time, which Catchline enforces automatically).",
      },
    ],
  },
  {
    heading: "8. Retention, return, and deletion",
    blocks: [
      {
        type: "p",
        text: "Catchline retains information only as long as needed to provide the Service. By default, closed conversations are purged after approximately 12 months, and the Clinic may request a different retention period or earlier deletion. On termination, Catchline will, at the Clinic's choice, return or delete the Clinic's information within a reasonable period, except where retention is required by law.",
      },
    ],
  },
  {
    heading: "9. Breach notification",
    blocks: [
      {
        type: "p",
        text: "If Catchline becomes aware of a breach of security safeguards involving the information, it will notify the Clinic without undue delay and provide the information the Clinic reasonably needs to assess the breach and meet its own notification obligations under PHIPA and PIPEDA.",
      },
    ],
  },
  {
    heading: "10. Audits and information rights",
    blocks: [
      {
        type: "p",
        text: "On reasonable written request, Catchline will make available the information necessary to demonstrate compliance with this DPA, and will cooperate with reasonable audits, subject to confidentiality and to not compromising the security of other customers.",
      },
    ],
  },
  {
    heading: "11. Term, termination, and survival",
    blocks: [
      {
        type: "p",
        text: "This DPA applies for as long as Catchline processes the information for the Clinic. Obligations that by their nature should survive termination — including confidentiality and deletion — continue after it ends.",
      },
    ],
  },
  {
    heading: "12. Governing law",
    blocks: [
      {
        type: "p",
        text: "This DPA is governed by the laws of the Province of Ontario and the federal laws of Canada applicable there, unless the parties agree otherwise in the service agreement. [Confirm with counsel.]",
      },
    ],
  },
  {
    heading: "Annex A — Details of processing",
    blocks: [
      {
        type: "table",
        columns: ["Item", "Detail"],
        rows: [
          ["Subject matter", "Missed-call recovery and SMS intake for the Clinic."],
          ["Duration", "Term of the service agreement plus the retention period in Section 8."],
          ["Nature and purpose", "Text-back, two-way SMS, narrow AI intake, logging, and front-desk paging."],
          [
            "Types of data",
            "Phone number, name, reason and message content (may include health information), urgency, booking intent, call records, staff login.",
          ],
          ["Categories of individuals", "Callers/patients and clinic staff users."],
        ],
      },
    ],
  },
  {
    heading: "Annex B — Approved sub-processors",
    blocks: [
      {
        type: "table",
        columns: ["Sub-processor", "Purpose and location"],
        rows: [
          ["Supabase", "Database and authentication — hosted in Canada (Montreal)."],
          ["Vercel", "Application hosting."],
          ["Twilio", "Calls and SMS — may process data in the United States."],
          ["OpenAI / Anthropic", "Generating intake replies from message text — United States."],
          ["Resend (if email enabled)", "Notification emails."],
        ],
      },
    ],
  },
  {
    heading: "Annex C — Security measures",
    blocks: [
      {
        type: "ul",
        items: [
          "Encryption in transit (HTTPS/TLS) across the website, dashboard, and webhooks.",
          "Multi-tenant isolation enforced at the database level so one clinic cannot access another's data.",
          "Least-privilege handling of secrets; the privileged database key is server-side only.",
          "Append-only audit log of sensitive actions (replies, takeovers, settings changes) that cannot be altered or deleted.",
          "Validation and signature verification on incoming calls and messages; retries with idempotency to prevent duplicates.",
          "Dependency scanning and security headers, with patches applied as advisories arise.",
        ],
      },
    ],
  },
  {
    heading: "Signatures",
    blocks: [
      {
        type: "p",
        text: "Clinic: [Clinic legal name] — Signed by [name], [title] — Date [ ].",
      },
      {
        type: "p",
        text: "Catchline: [Catchline legal entity] — Signed by [name], [title] — Date [ ].",
      },
      { type: "contact", email: BRAND.supportEmail },
    ],
  },
];

export default function DpaPage() {
  return (
    <LegalPage
      title="Data Processing Agreement"
      updated={UPDATED}
      intro="This agreement sets out how Catchline handles information on behalf of the dental clinics it serves: our roles, the security we apply, who our sub-processors are, where data lives, how we handle breaches, and how data is deleted."
      sections={sections}
    />
  );
}
