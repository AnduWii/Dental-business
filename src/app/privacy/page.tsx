import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND.name}`,
  description:
    "How Catchline collects, uses, stores, and protects information when it recovers missed calls for dental clinics.",
};

const UPDATED = "June 21, 2026";

const sections: LegalSection[] = [
  {
    heading: "Who we are and what this covers",
    blocks: [
      {
        type: "p",
        text: "Catchline provides missed-call recovery for dental clinics. When a call to a clinic goes unanswered, we text the caller back from the clinic's number, run a short automated intake to learn who they are and what they need, log the conversation, and alert the clinic's front desk.",
      },
      {
        type: "p",
        text: "This policy explains what information we handle when you interact with Catchline, why we handle it, and the choices you have. It applies to people who contact a clinic that uses Catchline, and to clinic staff who use our dashboard.",
      },
      {
        type: "note",
        text: "If you are a patient or caller: the clinic you called decides what information it collects about you and how it is used. Catchline acts on that clinic's behalf. For requests about your information, you can contact the clinic directly or reach us at the address below and we will route it to the clinic.",
      },
    ],
  },
  {
    heading: "Information we handle",
    blocks: [
      {
        type: "p",
        text: "We deliberately keep this to the minimum needed to recover a missed call into a booking conversation. We do not collect clinical records, treatment history, insurance, or payment information.",
      },
      {
        type: "table",
        columns: ["What we handle", "Why"],
        rows: [
          ["Your phone number", "To text you back after a missed call and continue the conversation."],
          ["Your name", "So clinic staff can recognise and help you."],
          [
            "The reason for your call and your messages",
            "To understand what you need. This may include health-related information you choose to share.",
          ],
          ["Urgency and booking intent", "To help the clinic triage and prioritise your request."],
          ["Call records (time, number, missed-call events)", "To recover the call and keep an accurate log."],
          ["Clinic staff email and name", "To create and secure dashboard logins."],
        ],
      },
    ],
  },
  {
    heading: "How we use information",
    blocks: [
      {
        type: "ul",
        items: [
          "Send the automatic text-back and carry on the SMS conversation.",
          "Run a short, narrow intake to capture your name, reason, urgency, and booking intent.",
          "Show the conversation and lead to the clinic and page its front desk.",
          "Operate, secure, debug, and improve the service.",
        ],
      },
      {
        type: "p",
        text: "We do not sell your information, and we do not use the content of your messages to train AI models. Where an AI provider helps generate intake replies, it processes the text only to produce the response and not for its own training (this is the default for the OpenAI and Anthropic APIs we use).",
      },
    ],
  },
  {
    heading: "Text messages and consent",
    blocks: [
      {
        type: "p",
        text: "Because you called the clinic first, our text-back is a direct response to your inquiry, and our messages are service-related rather than promotional. Every message identifies the clinic.",
      },
      {
        type: "p",
        text: "You are always in control of the texts. Reply STOP at any time to opt out — we will stop texting that number, and the clinic's dashboard composer is disabled for it. Reply START to opt back in, and HELP for help. This is consistent with Canada's anti-spam law (CASL).",
      },
    ],
  },
  {
    heading: "Who we share information with",
    blocks: [
      {
        type: "p",
        text: "We share information with the clinic you contacted, and with the service providers (sub-processors) that help us run Catchline. We require these providers to protect the data and use it only to provide their service to us:",
      },
      {
        type: "ul",
        items: [
          "Supabase — database and authentication (hosted in Canada).",
          "Vercel — application hosting.",
          "Twilio — sending and receiving calls and text messages.",
          "OpenAI / Anthropic — generating intake replies from message text.",
          "Resend (if email is enabled) — sending notification emails.",
        ],
      },
      {
        type: "p",
        text: "We may also disclose information if required by law, or to protect the rights, safety, and security of our users and the public. We do not sell personal information.",
      },
    ],
  },
  {
    heading: "Where your data is stored",
    blocks: [
      {
        type: "p",
        text: "Our primary database is hosted in Canada (Montreal region) to support Canadian data-residency expectations. Some of our service providers — for example, the telephony and AI providers that send your texts and generate replies — may process limited data such as your phone number and message text in the United States. By using the service you understand this information may be processed outside your province or country.",
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      {
        type: "p",
        text: "We keep conversation data only as long as needed. By default, closed conversations are purged after about 12 months, and clinics can request earlier deletion. Clinic logins are kept while the account is active.",
      },
    ],
  },
  {
    heading: "Your rights and choices",
    blocks: [
      {
        type: "p",
        text: "Depending on where you live, you may have the right to access, correct, or delete the information we hold about you, and to withdraw consent. We support these rights:",
      },
      {
        type: "ul",
        items: [
          "Access and correction — ask the clinic, or contact us, to see or fix your information.",
          "Deletion — ask to have your information erased; we can remove a caller's data and everything linked to it.",
          "Opt out of texts — reply STOP at any time.",
        ],
      },
      {
        type: "p",
        text: "To exercise a right, contact the clinic you dealt with, or reach us using the details below and we will help.",
      },
    ],
  },
  {
    heading: "How we protect information",
    blocks: [
      {
        type: "ul",
        items: [
          "Encryption in transit (HTTPS/TLS) for the website, dashboard, and webhooks.",
          "Strict separation between clinics so one clinic can never see another's data.",
          "Least-privilege access to secrets and an append-only audit log of sensitive actions.",
          "Input validation and signature checks on incoming calls and messages.",
        ],
      },
    ],
  },
  {
    heading: "Which privacy laws apply",
    blocks: [
      {
        type: "p",
        text: "Catchline serves dental clinics in Ontario, Canada, so the governing regimes are Canada's PIPEDA and Ontario's PHIPA (health-information privacy), together with CASL for messaging. Catchline is generally not a US HIPAA covered entity. If you are an EU resident, we honour the core data-subject rights described above.",
      },
    ],
  },
  {
    heading: "Children",
    blocks: [
      {
        type: "p",
        text: "Catchline is a tool for dental clinics and is not directed at children. A parent or guardian may share a minor patient's information with a clinic when arranging care.",
      },
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy from time to time. When we do, we will revise the date at the top of this page. Material changes will be communicated to clinics using the service.",
      },
    ],
  },
  {
    heading: "Contact us",
    blocks: [
      {
        type: "p",
        text: "Catchline is operated by Andrew Li. Questions about this policy or your information? We are happy to help.",
      },
      { type: "contact", email: BRAND.supportEmail },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro="Catchline recovers missed calls for dental clinics. We hold the minimum information needed to do that, we keep it in Canada, and we never sell it. Here is exactly what we handle and the choices you have."
      sections={sections}
    />
  );
}
