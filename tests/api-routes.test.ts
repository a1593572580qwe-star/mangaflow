import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as getConfig } from "@/app/api/ai/config/route";
import { POST as postAnalyze } from "@/app/api/ai/analyze/route";
import { POST as postStoryboard } from "@/app/api/ai/storyboard/route";
import { POST as postPage } from "@/app/api/ai/page/route";
import { POST as postRegenerate } from "@/app/api/ai/regenerate/route";
import { POST as postCheck } from "@/app/api/ai/check/route";
import { DEMO_PROJECTS } from "@/data/demoProjects";

const sampleProject = DEMO_PROJECTS[0];

describe("API Routes (End-to-end Handler Integration)", () => {
  test("GET /api/ai/config returns configuration status without exposing private keys", async () => {
    const res = await getConfig();
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(typeof data.isConfigured === "boolean");
    assert.ok(typeof data.baseUrl === "string");
    assert.ok(typeof data.model === "string");
    assert.ok(typeof data.hasApiKey === "boolean");
    assert.strictEqual(data.apiKey, undefined, "apiKey must never be exposed to clients");
  });

  test("POST /api/ai/analyze handles empty and oversized inputs properly", async () => {
    // Empty synopsis
    const reqEmpty = new NextRequest("http://localhost/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ project: { ...sampleProject, synopsis: "   " } }),
    });
    const resEmpty = await postAnalyze(reqEmpty);
    assert.strictEqual(resEmpty.status, 400);
    const dataEmpty = await resEmpty.json();
    assert.ok(dataEmpty.error.includes("不能为空"));

    // Oversized input (> 50,000 chars)
    const longText = "暴雨下的钟楼。".repeat(8000);
    const reqLong = new NextRequest("http://localhost/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ project: { ...sampleProject, synopsis: longText } }),
    });
    const resLong = await postAnalyze(reqLong);
    assert.strictEqual(resLong.status, 400);
    const dataLong = await resLong.json();
    assert.ok(dataLong.error.includes("过长"));
  });

  test("POST /api/ai/analyze succeeds in Demo Mode when no API key configured", async () => {
    const req = new NextRequest("http://localhost/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ project: sampleProject }),
    });
    const res = await postAnalyze(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.isDemoMode, true);
    assert.ok(data.analysis.events.length > 0);
    assert.ok(data.analysis.keyBeats.length > 0);
  });

  test("POST /api/ai/storyboard validates input and generates demo pages", async () => {
    // Missing synopsis
    const reqEmpty = new NextRequest("http://localhost/api/ai/storyboard", {
      method: "POST",
      body: JSON.stringify({ project: { ...sampleProject, synopsis: "" } }),
    });
    const resEmpty = await postStoryboard(reqEmpty);
    assert.strictEqual(resEmpty.status, 400);

    // Valid demo generation
    const req = new NextRequest("http://localhost/api/ai/storyboard", {
      method: "POST",
      body: JSON.stringify({ project: sampleProject }),
    });
    const res = await postStoryboard(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.isDemoMode, true);
    assert.ok(data.pages.length > 0);
    assert.ok(data.pages[0].panels.length > 0);
  });

  test("POST /api/ai/page validates inputs and generates single page in Demo Mode", async () => {
    // Missing synopsis
    const reqEmpty = new NextRequest("http://localhost/api/ai/page", {
      method: "POST",
      body: JSON.stringify({ project: { ...sampleProject, synopsis: " " } }),
    });
    const resEmpty = await postPage(reqEmpty);
    assert.strictEqual(resEmpty.status, 400);

    // Overly long instruction
    const reqLong = new NextRequest("http://localhost/api/ai/page", {
      method: "POST",
      body: JSON.stringify({
        project: sampleProject,
        pageNumber: 1,
        instruction: "长指令".repeat(1500),
      }),
    });
    const resLong = await postPage(reqLong);
    assert.strictEqual(resLong.status, 400);

    // Valid demo call
    const req = new NextRequest("http://localhost/api/ai/page", {
      method: "POST",
      body: JSON.stringify({
        project: sampleProject,
        pageId: sampleProject.pages[0].pageId,
        pageNumber: 1,
        instruction: "优化特写镜头",
      }),
    });
    const res = await postPage(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.isDemoMode, true);
    assert.strictEqual(data.page.pageNumber, 1);
  });

  test("POST /api/ai/regenerate modifies target panel in Demo Mode", async () => {
    const targetPanel = sampleProject.pages[0].panels[0];

    // Missing panelId
    const reqBad = new NextRequest("http://localhost/api/ai/regenerate", {
      method: "POST",
      body: JSON.stringify({ panel: {} }),
    });
    const resBad = await postRegenerate(reqBad);
    assert.strictEqual(resBad.status, 400);

    // Valid demo call
    const req = new NextRequest("http://localhost/api/ai/regenerate", {
      method: "POST",
      body: JSON.stringify({
        panel: targetPanel,
        instruction: "改为中景全景，强化背景雨水",
      }),
    });
    const res = await postRegenerate(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.isDemoMode, true);
    assert.strictEqual(data.panel.panelId, targetPanel.panelId);
    assert.strictEqual(data.panel.shotSize, "wide");
  });

  test("POST /api/ai/check generates continuity report", async () => {
    // Missing pages
    const reqEmpty = new NextRequest("http://localhost/api/ai/check", {
      method: "POST",
      body: JSON.stringify({ project: { ...sampleProject, pages: [] } }),
    });
    const resEmpty = await postCheck(reqEmpty);
    assert.strictEqual(resEmpty.status, 400);

    // Valid check
    const req = new NextRequest("http://localhost/api/ai/check", {
      method: "POST",
      body: JSON.stringify({ project: sampleProject }),
    });
    const res = await postCheck(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.isDemoMode, true);
    assert.ok(data.report.score > 0);
    assert.ok(Array.isArray(data.report.continuityIssues));
  });
});
