export type AuthDisplayEnvironment = {
  matchMedia?: (query: string) => { matches: boolean };
  navigator?: Navigator | { standalone?: boolean };
};

export type GoogleSignInMode = "popup" | "redirect";

export function isInstalledPwa(environment: AuthDisplayEnvironment) {
  return environment.matchMedia?.("(display-mode: standalone)").matches === true
    || (typeof environment.navigator === "object"
      && environment.navigator !== null
      && "standalone" in environment.navigator
      && environment.navigator.standalone === true);
}

export function googleSignInMode(environment: AuthDisplayEnvironment): GoogleSignInMode {
  return isInstalledPwa(environment) ? "redirect" : "popup";
}
