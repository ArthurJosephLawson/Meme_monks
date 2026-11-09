import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeText, sanitizeUrl, isValidUrl } from "../lib/sanitize.ts";

describe("sanitizeText", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(sanitizeText("  hello   world \n"), "hello world");
  });

  it("strips control characters", () => {
    assert.equal(sanitizeText("ab\u0000\u001fcd\u007f"), "ab cd");
  });

  it("caps length", () => {
    assert.equal(sanitizeText("a".repeat(300), 80).length, 80);
  });

  it("returns empty for non-strings", () => {
    assert.equal(sanitizeText(42), "");
    assert.equal(sanitizeText(null), "");
    assert.equal(sanitizeText({ evil: true }), "");
  });
});

describe("sanitizeUrl", () => {
  it("accepts http(s) URLs", () => {
    assert.equal(
      sanitizeUrl("https://example.com/meme.png"),
      "https://example.com/meme.png",
    );
  });

  it("rejects javascript: and data: URLs", () => {
    assert.equal(sanitizeUrl("javascript:alert(1)"), "");
    assert.equal(sanitizeUrl("data:text/html,<script>"), "");
  });

  it("rejects non-http(s) protocols", () => {
    assert.equal(sanitizeUrl("ftp://example.com"), "");
    assert.equal(sanitizeUrl("file:///etc/passwd"), "");
  });

  it("rejects malformed input", () => {
    assert.equal(sanitizeUrl("not a url"), "");
    assert.equal(sanitizeUrl(""), "");
    assert.equal(sanitizeUrl(undefined), "");
  });
});

describe("isValidUrl", () => {
  it("mirrors sanitizeUrl emptiness", () => {
    assert.equal(isValidUrl("https://ok.example"), true);
    assert.equal(isValidUrl("javascript:alert(1)"), false);
  });
});
