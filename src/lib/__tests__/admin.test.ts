import { describe, it, expect } from "vitest";
import { isAdminEmail } from "@/lib/admin";

describe("isAdminEmail", () => {
  it("recognizes the default founder admin", () => {
    expect(isAdminEmail("andrewbirdie777@gmail.com")).toBe(true);
  });
  it("is case-insensitive", () => {
    expect(isAdminEmail("AndrewBirdie777@Gmail.com")).toBe(true);
  });
  it("rejects everyone else", () => {
    expect(isAdminEmail("someone@clinic.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
