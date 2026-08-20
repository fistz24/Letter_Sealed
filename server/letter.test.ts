import { describe, expect, it } from "vitest";
import { isLetterComplete, nextRevealProgress } from "../shared/letter";

describe("letter reveal interaction", () => {
  it("advances progress without exceeding the end of the page", () => {
    expect(nextRevealProgress(24)).toBe(37);
    expect(nextRevealProgress(95)).toBe(100);
  });

  it("keeps invalid progress safe and identifies a complete letter", () => {
    expect(nextRevealProgress(-20, 10)).toBe(10);
    expect(nextRevealProgress(60, 0)).toBe(61);
    expect(isLetterComplete(100)).toBe(true);
    expect(isLetterComplete(99)).toBe(false);
  });
});
