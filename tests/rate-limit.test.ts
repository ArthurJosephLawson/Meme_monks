import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "../lib/rate-limit.ts";

let now = 0;
const tick = () => (now += 1000);

describe("rateLimit", () => {
  beforeEach(() => {
    now = 0;
  });

  it("allows up to max requests in the window", () => {
    for (let i = 0; i < 5; i++) {
      assert.equal(rateLimit("k1", { max: 5, windowMs: 60_000, now: tick }).allowed, true);
    }
    assert.equal(rateLimit("k1", { max: 5, windowMs: 60_000, now: tick }).allowed, false);
  });

  it("resets after the window passes", () => {
    for (let i = 0; i < 3; i++) rateLimit("k2", { max: 3, windowMs: 60_000, now: tick });
    assert.equal(rateLimit("k2", { max: 3, windowMs: 60_000, now: tick }).allowed, false);
    // Jump past the window.
    now += 61_000;
    assert.equal(rateLimit("k2", { max: 3, windowMs: 60_000, now: tick }).allowed, true);
  });

  it("keys buckets independently", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", { max: 5, windowMs: 60_000, now: tick });
    assert.equal(rateLimit("a", { max: 5, windowMs: 60_000, now: tick }).allowed, false);
    assert.equal(rateLimit("b", { max: 5, windowMs: 60_000, now: tick }).allowed, true);
  });

  it("reports remaining and retry-after", () => {
    rateLimit("k3", { max: 2, windowMs: 60_000, now: tick });
    const r = rateLimit("k3", { max: 2, windowMs: 60_000, now: tick });
    assert.equal(r.allowed, true);
    assert.equal(r.remaining, 0);
    const blocked = rateLimit("k3", { max: 2, windowMs: 60_000, now: tick });
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterMs > 0);
  });
});
