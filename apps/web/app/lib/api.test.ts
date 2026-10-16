import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, forwardedHeaders } from "./api";

afterEach(() => {
  vi.unstubAllEnvs();
});

/**
 * Loaders and actions run on the server, where the public URL (behind nginx)
 * may not resolve - so they reach the API over loopback.
 */
describe("apiUrl", () => {
  it("defaults to loopback on the API port", () => {
    vi.stubEnv("API_INTERNAL_URL", "");
    vi.stubEnv("PORT", "3000");
    expect(apiUrl("/api/me").href).toBe("http://127.0.0.1:3000/api/me");
  });

  it("can be pointed elsewhere with API_INTERNAL_URL", () => {
    vi.stubEnv("API_INTERNAL_URL", "http://api.internal:8080");
    expect(apiUrl("/api/me").href).toBe("http://api.internal:8080/api/me");
  });
});

describe("forwardedHeaders", () => {
  it("passes on the session, CSRF and client-IP headers of the browser request", () => {
    const request = new Request("https://app.example/hu/login", {
      headers: {
        cookie: "session=abc",
        origin: "https://app.example",
        "sec-fetch-site": "same-origin",
        "x-forwarded-for": "203.0.113.7",
        "user-agent": "phone",
      },
    });

    expect(forwardedHeaders(request)).toEqual({
      cookie: "session=abc",
      origin: "https://app.example",
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": "203.0.113.7",
      "user-agent": "phone",
    });
  });

  it("drops everything else, e.g. the body's content headers", () => {
    const request = new Request("https://app.example/hu/login", {
      method: "POST",
      body: "x",
      headers: { "content-type": "text/plain", host: "app.example", "x-other": "1" },
    });

    expect(forwardedHeaders(request)).toEqual({});
  });
});
