import { describe, expect, it } from "vitest";
import { googleSignInMode, isInstalledPwa } from "./auth-mode";

describe("installed PWA detection", () => {
  it("uses the standalone display mode when available", () => {
    const environment = {
      matchMedia: (query: string) => ({ matches: query === "(display-mode: standalone)" })
    };

    expect(isInstalledPwa(environment)).toBe(true);
    expect(googleSignInMode(environment)).toBe("redirect");
  });

  it("supports iOS Safari's standalone navigator flag", () => {
    const environment = { navigator: { standalone: true } };

    expect(isInstalledPwa(environment)).toBe(true);
    expect(googleSignInMode(environment)).toBe("redirect");
  });

  it("keeps popup auth for regular browser tabs", () => {
    const environment = {
      matchMedia: () => ({ matches: false }),
      navigator: { standalone: false }
    };

    expect(isInstalledPwa(environment)).toBe(false);
    expect(googleSignInMode(environment)).toBe("popup");
  });
});
