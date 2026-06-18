import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  isValidE164,
  isValidEmail,
  sanitizeText,
  oneOf,
} from "@/lib/validation";

describe("normalizePhone", () => {
  it("passes through valid E.164", () => {
    expect(normalizePhone("+16475550199")).toBe("+16475550199");
  });
  it("formats a 10-digit NANP number", () => {
    expect(normalizePhone("(647) 555-0199")).toBe("+16475550199");
  });
  it("formats an 11-digit number starting with 1", () => {
    expect(normalizePhone("1 647 555 0199")).toBe("+16475550199");
  });
  it("rejects junk", () => {
    expect(normalizePhone("hello")).toBeNull();
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
  });
});

describe("isValidE164 / isValidEmail", () => {
  it("validates E.164", () => {
    expect(isValidE164("+16475550199")).toBe(true);
    expect(isValidE164("6475550199")).toBe(false);
  });
  it("validates email", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
  });
});

describe("sanitizeText", () => {
  it("trims and caps length", () => {
    expect(sanitizeText("  hi  ", 100)).toBe("hi");
    expect(sanitizeText("abcdef", 3)).toBe("abc");
  });
  it("strips control characters but keeps newlines", () => {
    const input = "a" + String.fromCharCode(7) + "b" + String.fromCharCode(10) + "c";
    expect(sanitizeText(input, 100)).toBe("ab\nc");
  });
  it("handles non-strings", () => {
    expect(sanitizeText(null, 10)).toBe("");
  });
});

describe("oneOf", () => {
  it("guards against values outside the allow-list", () => {
    expect(oneOf("ai", ["ai", "human"] as const)).toBe("ai");
    expect(oneOf("evil", ["ai", "human"] as const)).toBeNull();
  });
});
