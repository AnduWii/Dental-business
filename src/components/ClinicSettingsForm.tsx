// Shared clinic settings form. Used by the clinic owner (/settings) and by a
// platform admin editing any clinic (/admin/clinics/[id]). The server action
// is passed in; a hidden clinic_id lets the admin action target a specific
// clinic (the owner action ignores it and uses the session).
import type { Clinic } from "@/lib/types";

export function ClinicSettingsForm({
  clinic,
  action,
  appUrl,
}: {
  clinic: Clinic;
  action: (formData: FormData) => Promise<void>;
  appUrl: string;
}) {
  const voiceUrl = `${appUrl}/api/twilio/voice`;
  const smsUrl = `${appUrl}/api/twilio/sms`;

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="clinic_id" value={clinic.id} />

      <Section title="Clinic">
        <Field label="Clinic name" name="name" defaultValue={clinic.name} required />
        <Field
          label="Timezone"
          name="timezone"
          defaultValue={clinic.timezone}
          hint="IANA timezone, e.g. America/Toronto"
        />
      </Section>

      <Section title="Phone & SMS">
        <Field
          label="Catchline phone number"
          name="twilio_number"
          defaultValue={clinic.twilio_number ?? ""}
          placeholder="+16475550100"
          hint="The Twilio number missed calls forward to, and that texts patients. E.164 format."
        />
        <Field
          label="Messaging Service SID (optional)"
          name="twilio_messaging_service_sid"
          defaultValue={clinic.twilio_messaging_service_sid ?? ""}
          placeholder="MGxxxxxxxx"
          hint="Recommended for 10DLC. If set, texts send via this service."
        />
      </Section>

      <Section title="Where we page the front desk">
        <Field
          label="Front-desk mobile"
          name="notify_phone"
          defaultValue={clinic.notify_phone ?? ""}
          placeholder="+16475551234"
        />
        <Field
          label="Notification email"
          name="notify_email"
          type="email"
          defaultValue={clinic.notify_email ?? ""}
        />
      </Section>

      <Section title="Conversation">
        <div>
          <label className="block text-sm font-medium text-slate-700">First text-back message</label>
          <textarea
            name="textback_message"
            rows={3}
            defaultValue={clinic.textback_message}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Use <code>{"{{clinic}}"}</code> to insert the clinic name.
          </p>
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="ai_enabled"
            defaultChecked={clinic.ai_enabled}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">
            Let autopilot reply and capture details automatically
          </span>
        </label>
      </Section>

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
      >
        Save settings
      </button>

      <Section title="Connect the phone (one-time setup)">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>In Twilio, open this clinic&apos;s number configuration.</li>
          <li>
            Set <strong>A Call Comes In</strong> (Webhook, HTTP POST) to:
            <Code>{voiceUrl}</Code>
          </li>
          <li>
            Set <strong>A Message Comes In</strong> (Webhook, HTTP POST) to:
            <Code>{smsUrl}</Code>
          </li>
          <li>
            On the clinic&apos;s real line, enable <em>conditional call forwarding</em> (forward on
            no-answer / busy) to the Catchline number above.
          </li>
        </ol>
        <p className="text-xs text-slate-500">
          Subscription: <span className="font-medium capitalize">{clinic.subscription_status}</span>
        </p>
      </Section>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="mt-1 block break-all rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
      {children}
    </code>
  );
}
