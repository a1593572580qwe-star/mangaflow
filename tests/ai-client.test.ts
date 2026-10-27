import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { extractJsonFromText, getEffectiveApiConfig } from "@/lib/ai/client";

describe("AI Client Utility Functions", () => {
  test("extractJsonFromText extracts JSON from markdown code fence", () => {
    const markdown = "Here is your storyboard:\n```json\n{\"pages\": [{\"pageNumber\": 1}]}\n```\nHope you like it!";
    const extracted = extractJsonFromText(markdown);
    assert.strictEqual(extracted, '{"pages": [{\"pageNumber\": 1}]}');
    assert.doesNotThrow(() => JSON.parse(extracted));
  });

  test("extractJsonFromText extracts bare JSON object with surrounding chatter", () => {
    const text = "Sure! {\"status\": \"ok\", \"count\": 42} That was it.";
    const extracted = extractJsonFromText(text);
    assert.strictEqual(extracted, '{"status": "ok", "count": 42}');
    assert.doesNotThrow(() => JSON.parse(extracted));
  });

  test("extractJsonFromText extracts JSON array with surrounding chatter", () => {
    const text = "Prefix [{\"id\": 1}, {\"id\": 2}] Postfix";
    const extracted = extractJsonFromText(text);
    assert.strictEqual(extracted, '[{"id": 1}, {"id": 2}]');
    assert.doesNotThrow(() => JSON.parse(extracted));
  });

  test("extractJsonFromText returns raw string if no JSON boundaries found", () => {
    const plain = "Just plain text with no brackets";
    const extracted = extractJsonFromText(plain);
    assert.strictEqual(extracted, plain);
  });

  test("getEffectiveApiConfig applies defaults when no env or options provided", () => {
    const prevKey = process.env.STORYBOARD_API_KEY;
    delete process.env.STORYBOARD_API_KEY;

    const config = getEffectiveApiConfig();
    assert.strictEqual(config.baseUrl, "https://api.openai.com/v1");
    assert.strictEqual(config.model, "gpt-4o-mini");
    assert.strictEqual(config.isConfigured, false);

    if (prevKey) process.env.STORYBOARD_API_KEY = prevKey;
  });

  test("getEffectiveApiConfig prioritizes custom options over defaults", () => {
    const config = getEffectiveApiConfig({
      baseUrl: "https://custom-ai.example.com/v1/",
      apiKey: "test-token-123",
      model: "custom-model",
    });

    assert.strictEqual(config.baseUrl, "https://custom-ai.example.com/v1", "Trailing slash should be trimmed");
    assert.strictEqual(config.apiKey, "test-token-123");
    assert.strictEqual(config.model, "custom-model");
    assert.strictEqual(config.isConfigured, true);
  });

  test("callLLMWithJson rejects unconfigured API Key", async () => {
    const { callLLMWithJson } = await import("@/lib/ai/client");
    const { z } = await import("zod");
    await assert.rejects(
      async () => {
        await callLLMWithJson([{ role: "user", content: "test" }], z.object({}), { apiKey: "" });
      },
      /STORYBOARD_API_KEY 未配置/
    );
  });

  test("callLLMWithJson rejects invalid Base URL protocol or malformed URL", async () => {
    const { callLLMWithJson } = await import("@/lib/ai/client");
    const { z } = await import("zod");
    await assert.rejects(
      async () => {
        await callLLMWithJson([{ role: "user", content: "test" }], z.object({}), {
          apiKey: "test-key",
          baseUrl: "ftp://invalid-url.com",
        });
      },
      /AI Base URL 无效/
    );
  });
});

