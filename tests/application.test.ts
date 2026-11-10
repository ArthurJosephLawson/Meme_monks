import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateApplication,
  validateUploadMeta,
  sniffImageType,
  BASE_PRICE_NPR,
  MAX_UPLOAD_BYTES,
} from "../lib/application.ts";

const VALID = {
  name: "Juniper Vale",
  portfolio: "https://example.com/work",
  submissionType: "CONCEPT_DESCRIPTION",
  conceptText: "A monk Photoshop-battling a deep-fried JPEG.",
  agreedToPolicy: true,
};

describe("validateApplication", () => {
  it("accepts a valid concept application", () => {
    const r = validateApplication(VALID);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.value.basePriceNpr, BASE_PRICE_NPR);
      assert.equal(r.value.agreedToPolicy, true);
      assert.equal(r.value.submissionType, "CONCEPT_DESCRIPTION");
    }
  });

  it("accepts a valid upload application without concept text", () => {
    const r = validateApplication({ ...VALID, submissionType: "UPLOAD" }, { size: 1000, type: "image/png", name: "meme.png" });
    assert.equal(r.ok, true);
  });

  it("rejects agreedToPolicy that is not literal true", () => {
    for (const bad of ["true", 1, "yes", undefined, null, false]) {
      const r = validateApplication({ ...VALID, agreedToPolicy: bad as never });
      assert.equal(r.ok, false, `agreedToPolicy=${String(bad)} must fail`);
    }
  });

  it("rejects unknown submission types", () => {
    const r = validateApplication({ ...VALID, submissionType: "SPAM" as never });
    assert.equal(r.ok, false);
  });

  it("requires concept text of at least 10 chars for concepts", () => {
    const r = validateApplication({ ...VALID, conceptText: "short" });
    assert.equal(r.ok, false);
  });

  it("rejects short names", () => {
    const r = validateApplication({ ...VALID, name: "J" });
    assert.equal(r.ok, false);
  });

  it("rejects non-http(s) or malformed portfolio links", () => {
    const r = validateApplication({ ...VALID, portfolio: "javascript:alert(1)" });
    assert.equal(r.ok, false);
  });

  it("always assigns the server-owned baseline price", () => {
    const r = validateApplication(VALID);
    if (r.ok) assert.equal(r.value.basePriceNpr, 20);
  });
});

describe("validateUploadMeta", () => {
  it("accepts a matching PNG", () => {
    assert.equal(validateUploadMeta({ size: 1024, type: "image/png", name: "meme.png" }), null);
  });

  it("accepts .jpeg as image/jpeg", () => {
    assert.equal(validateUploadMeta({ size: 1024, type: "image/jpeg", name: "meme.jpeg" }), null);
  });

  it("rejects oversized files", () => {
    const r = validateUploadMeta({ size: MAX_UPLOAD_BYTES + 1, type: "image/png", name: "meme.png" });
    assert.notEqual(r, null);
  });

  it("rejects disallowed MIME types", () => {
    assert.notEqual(validateUploadMeta({ size: 1024, type: "image/svg+xml", name: "evil.svg" }), null);
    assert.notEqual(validateUploadMeta({ size: 1024, type: "application/pdf", name: "evil.pdf" }), null);
  });

  it("rejects extension/MIME mismatch (disguised executables)", () => {
    assert.notEqual(validateUploadMeta({ size: 1024, type: "image/png", name: "meme.exe" }), null);
    assert.notEqual(validateUploadMeta({ size: 1024, type: "application/x-msdownload", name: "meme.png" }), null);
  });

  it("rejects zero-byte files", () => {
    assert.notEqual(validateUploadMeta({ size: 0, type: "image/png", name: "meme.png" }), null);
  });
});

describe("sniffImageType", () => {
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
  const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0];
  const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0];
  const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
  const EXE = [0x4d, 0x5a, 0x90, 0x00, 0, 0, 0, 0, 0, 0, 0, 0]; // "MZ"

  it("identifies real images", () => {
    assert.equal(sniffImageType(new Uint8Array(PNG)), "image/png");
    assert.equal(sniffImageType(new Uint8Array(JPEG)), "image/jpeg");
    assert.equal(sniffImageType(new Uint8Array(GIF)), "image/gif");
    assert.equal(sniffImageType(new Uint8Array(WEBP)), "image/webp");
  });

  it("rejects executables and polyglot junk", () => {
    assert.equal(sniffImageType(new Uint8Array(EXE)), null);
    assert.equal(sniffImageType(new Uint8Array("<script>alert(1)</script>".split("").map((c) => c.charCodeAt(0)))), null);
    assert.equal(sniffImageType(new Uint8Array(8)), null);
  });

  it("rejects short buffers", () => {
    assert.equal(sniffImageType(new Uint8Array([0x89, 0x50])), null);
  });
});
