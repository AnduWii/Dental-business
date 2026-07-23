import { describe, it, expect } from "vitest";
import { runIntake, extractName } from "@/lib/ai/intake";

// With no API key set, runIntake uses the deterministic fallback flow.
// These tests pin that safety-net behavior.

describe("intake fallback", () => {
  it("escalates a dental emergency", async () => {
    const res = await runIntake({
      clinicName: "Test Dental",
      history: [
        { role: "assistant", body: "Hi, sorry we missed you. How can we help?" },
        { role: "patient", body: "my tooth got knocked out playing hockey" },
      ],
      current: { caller_name: null, reason: null, urgency_level: "unknown", booking_intent: "unknown" },
    });
    expect(res.emergency).toBe(true);
    expect(res.fields.urgency_level).toBe("emergency");
    expect(res.reply.toLowerCase()).toMatch(/911|emergency room|urgent/);
  });

  it("asks for the caller's name first", async () => {
    const res = await runIntake({
      clinicName: "Test Dental",
      history: [
        { role: "assistant", body: "Hi, sorry we missed your call. How can we help?" },
        { role: "patient", body: "hi" },
      ],
      current: { caller_name: null, reason: null, urgency_level: "unknown", booking_intent: "unknown" },
    });
    expect(res.fields.intake_complete).toBe(false);
    expect(res.reply.toLowerCase()).toMatch(/name|texting with/);
  });

  it("captures the name once asked", async () => {
    const res = await runIntake({
      clinicName: "Test Dental",
      history: [
        { role: "assistant", body: "Who do we have the pleasure of texting with?" },
        { role: "patient", body: "Sarah" },
      ],
      current: { caller_name: null, reason: null, urgency_level: "unknown", booking_intent: "unknown" },
    });
    expect(res.fields.caller_name).toBe("Sarah");
  });

  it("extracts the name from a conversational reply, not the whole message", async () => {
    const res = await runIntake({
      clinicName: "Test Dental",
      history: [
        { role: "assistant", body: "Who do we have the pleasure of texting with?" },
        { role: "patient", body: "thanks, I'm Andrew" },
      ],
      current: { caller_name: null, reason: null, urgency_level: "unknown", booking_intent: "unknown" },
    });
    expect(res.fields.caller_name).toBe("Andrew");
    expect(res.reply).toContain("Andrew");
  });
});

describe("extractName", () => {
  it("handles introduction phrasings", () => {
    expect(extractName("thanks, I'm Andrew")).toBe("Andrew");
    expect(extractName("Hi, my name is John Smith")).toBe("John Smith");
    expect(extractName("it's Maria!")).toBe("Maria");
    expect(extractName("Sarah")).toBe("Sarah");
  });
  it("refuses obvious non-names so the script re-asks", () => {
    expect(extractName("yes")).toBeNull();
    expect(extractName("ok sure")).toBeNull();
  });
});
