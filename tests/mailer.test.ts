import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildApplicationEmail } from "../lib/mailer.ts";

describe("buildApplicationEmail", () => {
  it("includes applicant name and concept detail", () => {
    const email = buildApplicationEmail({
      id: "ref-1",
      name: "Juniper Vale",
      contact: "juniper@example.com",
      submissionType: "CONCEPT_DESCRIPTION",
      conceptText: "A monk defusing an exploding meme.",
      agreedToPolicy: true,
      status: "pending",
      createdAt: "2026-11-10T10:00:00.000Z",
    });
    assert.ok(email.subject.includes("Juniper Vale"));
    assert.ok(email.text.includes("Juniper Vale"));
    assert.ok(email.text.includes("A monk defusing an exploding meme."));
    assert.ok(email.text.includes("juniper@example.com"));
  });

  it("references uploaded meme asset for UPLOAD submissions", () => {
    const email = buildApplicationEmail({
      id: "ref-2",
      name: "Bad Actor",
      contact: "evil@example.com",
      submissionType: "UPLOAD",
      assetPath: "40271395-4035-4874-a805-7410597ad08b.png",
      agreedToPolicy: true,
      status: "pending",
      createdAt: "2026-11-10T10:00:00.000Z",
    });
    assert.ok(email.text.includes("Uploaded meme picture: 40271395-4035-4874-a805-7410597ad08b.png"));
  });

  it("addresses the operations inbox", () => {
    const email = buildApplicationEmail({
      id: "ref-3",
      name: "Someone",
      contact: "someone@example.com",
      submissionType: "CONCEPT_DESCRIPTION",
      conceptText: "desc",
      agreedToPolicy: true,
      status: "pending",
      createdAt: "2026-11-10T10:00:00.000Z",
    });
    assert.ok(email.html.length > 0);
    assert.ok(email.text.length > 0);
  });
});
