import huCommon from "./locales/hu/common.json";

/**
 * Translation resources are bundled, so a page renders its text in one pass
 * server-side with no loading state.
 */
export const defaultNS = "common";

export const resources = {
  hu: { common: huCommon },
} as const;

export type Resources = (typeof resources)["hu"];
