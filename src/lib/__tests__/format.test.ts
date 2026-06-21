import { describe, it, expect } from "vitest";
import { formatPhone, timeAgo, formatDateTime } from "@/lib/format";

describe("formatPhone", () => {
  it("pretty-prints a NANP E.164 number", () => {
    expect(formatPhone("+16475550199")).toBe("(647) 555-0199");
  });
  it("falls back to the raw value for non-NANP", () => {
    expect(formatPhone("+447911123456")).toBe("+447911123456");
  });
  it("handles empty", () => {
    expect(formatPhone(null)).toBe("-");
    expect(formatPhone(undefined)).toBe("-");
  });
});

describe("timeAgo", () => {
  it("says 'just now' for recent timestamps", () => {
    expect(timeAgo(new Date().toISOString())).toBe("just now");
  });
  it("returns minutes", () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("5m ago");
  });
  it("returns hours", () => {
    expect(timeAgo(new Date(Date.now() - 3 * 3_600_000).toISOString())).toBe("3h ago");
  });
  it("returns days", () => {
    expect(timeAgo(new Date(Date.now() - 2 * 86_400_000).toISOString())).toBe("2d ago");
  });
  it("returns a date string beyond a week", () => {
    const out = timeAgo(new Date(Date.now() - 30 * 86_400_000).toISOString());
    expect(out).not.toBe("just now");
    expect(out.length).toBeGreaterThan(0);
  });
  it("handles empty", () => {
    expect(timeAgo(null)).toBe("");
  });
});

describe("formatDateTime", () => {
  it("formats a date", () => {
    expect(formatDateTime(new Date("2026-06-18T14:30:00Z").toISOString()).length).toBeGreaterThan(0);
  });
  it("handles empty", () => {
    expect(formatDateTime(null)).toBe("");
  });
});
