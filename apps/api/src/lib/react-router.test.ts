import { describe, expect, it } from "vitest";
import { publicRequestOrigin } from "./react-router.js";

/**
 * Behind the TLS-terminating reverse proxy the socket is plain HTTP, but the
 * browser's `Origin` is https. React Router rejects form actions whose
 * `Origin` does not match `request.url`, so `request.url` must be built from
 * the public base URL.
 */
describe("publicRequestOrigin", () => {
  it("takes protocol and host (with port) from the public base URL", () => {
    expect(publicRequestOrigin("https://elektro.fromthe.test:8443")).toEqual({
      protocol: "https:",
      host: "elektro.fromthe.test:8443",
    });
    expect(publicRequestOrigin("https://elektro.example.hu/")).toEqual({
      protocol: "https:",
      host: "elektro.example.hu",
    });
  });

  it("works for plain local development too", () => {
    expect(publicRequestOrigin("http://localhost:3000")).toEqual({
      protocol: "http:",
      host: "localhost:3000",
    });
  });
});
