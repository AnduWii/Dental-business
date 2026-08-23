import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: `Privacy Policy · ${BRAND.name}`,
  description:
    "How Catchline collects, uses, stores, and protects information when it recovers missed calls for dental clinics and real estate offices.",
};

const UPDATED = "August 23, 2026";

const sections: LegalSection[] = [
  {
    heading: "Who we are and what this covers",
    blocks: [
      {
        type: "p",
        text: "Catchline provides missed-call recovery for local businesses, currently dental clinics and real estate offices (each, a business). When a call to a business goes unanswered, we text the caller back from the business's dedicated Catchline number, run a short automated intake to learn who they are and what they need, log the conversation, and alert the business's team.",
      },
      {
        type: "p",
        text: "This policy explains what information we handle when you interact with Catchline, why we handle it, and the choices you have. It applies to people who contact a business that uses Catchline, and to staff of those businesses who use our dashboard.",
      },
      {
        type: "note",
        text: "If you are a caller: the business you called decides what information it collects about you and how it is used. Catchline acts on that business's behalf. For requests about your information, you can contact the business directly, or reach us at the address below and we will route it to them.",
      },
    ],
  },
  {
    heading: "Information we handle",
    blocks: [
      {
        type: "p",
        text: "We deliberately keep this to the minimum needed to recover a missed call into a booking conversation. We do not collect clinical records, treatment history, insurance, financial statements, or payment information.",
      },
      {
        type: "table",
        columns: ["What we handle", "Why"],
        rows: [
          ["Your phone number", "To text you back after a missed call and continue the conversation."],
          ["Your name", "So the business's staff can recognise and help you."],
          [
            "The reason for your call and your messages",
            "To understand what you need. Depending on the business, this may include health-related information you choose to share with a dental clinic, or details you share with a real estate office such as the property you are calling about and your buying, selling, or renting plans.",
          ],
          ["Urgency and booking intent", "To help the business triage and prioritise your request."],
          ["Call records (time, number, missed-call events)", "To recover the call and keep an accurate log."],
          ["Business staff email and name", "To create and secure dashboard logins."],
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
          "Show the conversation and lead to the business and page its team.",
          "Operate, secure, debug, and improve the service.",
        ],
      },
      {
        type: "p",
        text: "We do not sell your information, and we do not use the content of your messages to train AI models. Where an AI provider helps generate intake replies, it processes the text only to produce the response and not for its own training (this is the default for the OpenAI and Anthropic APIs we use).",
      },
      {
        type: "p",
        text: "Catchline uses AI only for administrative intake and communication. It does not use AI to give medical or dental advice, to diagnose, to recommend or decide on treatment, or to make clinical judgments. Likewise, it does not use AI to give real estate, legal, mortgage, or financial advice, to value properties, or to negotiate or quote prices.",
      },
    ],
  },
  {
    heading: "Text messages and consent",
    blocks: [
      {
        type: "p",
        text: "Because you called the business first, our text-back is a direct response to your inquiry, and our messages are service-related rather than promotional. Every message identifies the business.",
      },
      {
        type: "p",
        text: "You are always in control of the texts. Reply STOP at any time to opt out, and we will stop texting that number and disable the business's dashboard composer for it. Reply START to opt back in, and HELP for help. This is consistent with Canada's anti-spam law (CASL).",
      },
    ],
  },
  {
    heading: "Who we share information with",
    blocks: [
      {
        type: "p",
        text: "We share information with the business you contacted, and with the service providers (sub-processors) that help us run Catchline. We require these providers to protect the data and use it only to provide their service to us:",
      },
      {
        type: "ul",
        items: [
          "Supabase: database and authentication, hosted in Canada.",
          "Vercel: application hosting.",
          "Twilio: sending and receiving calls and text messages.",
          "OpenAI and Anthropic: generating intake replies from message text.",
          "Resend (if email is enabled): sending notification emails.",
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
        text: "Our primary database is hosted in Canada (Montreal region) to support Canadian data-residency expectations. Some of our service providers, for example the telephony and AI providers that send your texts and generate replies, may process limited data such as your phone number and message text in the United States. By using the service you understand this information may be processed outside your province or country.",
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      {
        type: "p",
        text: "We keep conversation data only as long as needed. By default, closed conversations are purged after about 12 months, and a business can request earlier deletion. Staff logins are kept while the account is active.",
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
          "Access and correction: ask the business, or contact us, to see or fix your information.",
          "Deletion: ask to have your information erased, and we can remove a caller's data and everything linked to it.",
          "Opt out of texts: reply STOP at any time.",
        ],
      },
      {
        type: "p",
        text: "To exercise a right, contact the business you dealt with, or reach us using the details below and we will help.",
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
          "Strict separation between businesses so one can never see another's data.",
          "Role-based, least-privilege access to data and an append-only audit log of sensitive actions.",
          "Input validation and signature checks on incoming calls and messages.",
          "A documented internal information-security policy covering access, breach response, backups, retention, and vendor review.",
        ],
      },
    ],
  },
  {
    heading: "Which privacy laws apply",
    blocks: [
      {
        type: "p",
        text: "Catchline serves dental clinics and real estate offices in Ontario, Canada. The governing regime is Canada's PIPEDA, together with CASL for messaging. Where the business you called is a dental clinic, Ontario's PHIPA (health-information privacy) also applies, with the clinic as the health information custodian. Catchline is generally not a US HIPAA covered entity. If you are an EU resident, we honour the core data-subject rights described above.",
      },
    ],
  },
  {
    heading: "Children",
    blocks: [
      {
        type: "p",
        text: "Catchline is a tool for businesses and is not directed at children. A parent or guardian may share a minor's information with a business, for example when arranging a child's dental care.",
      },
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy from time to time. When we do, we will revise the date at the top of this page. Material changes will be communicated to businesses using the service.",
      },
    ],
  },
  {
    heading: "Contact us",
    blocks: [
      {
        type: "p",
        text: "Catchline is operated by Catchline Services Inc. Questions about this policy or your information? We are happy to help.",
      },
      { type: "contact", email: BRAND.supportEmail },
      {
        type: "p",
        text: "You can also reach us by mail at Catchline Services Inc., [mailing address].",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro="Catchline recovers missed calls for dental clinics and real estate offices. We hold the minimum information needed to do that, we keep it in Canada, and we never sell it. Here is exactly what we handle and the choices you have."
      sections={sections}
    />
  );
}
