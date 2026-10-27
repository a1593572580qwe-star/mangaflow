import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  generateMockAnalysis,
  generateMockPages,
  generateMockSinglePage,
  regenerateMockPanel,
} from "@/lib/ai/mockGenerator";
import { Project, StoryboardPageSchema, StoryAnalysisSchema, StoryboardPanelSchema } from "@/types/storyboard";

const testProject: Project = {
  id: "test-proj-mock",
  title: "时空回响",
  chapterTitle: "第一幕：命运的钟摆",
  synopsis: `暴雨如注的深夜，钟楼老钟敲响第十三声。守钟人陆远发现齿轮卡住了一枚带有家族徽记的黄铜怀表。
就在这时，黑衣少女林浅从暗影中走出，手中握着缺失的怀表指针。
“你终于发现了。”林浅的声音平静得令人心悸。
齿轮忽然开始疯狂逆转，整个钟楼的重力瞬间颠倒！`,
  characters: [
    { id: "c1", name: "陆远", role: "protagonist", visualTraits: "沧桑大衣，短发，眼神警惕", relation: "守钟人" },
    { id: "c2", name: "林浅", role: "protagonist", visualTraits: "黑色兜帽长袍，冷峻少年感", relation: "闯入者" },
  ],
  setting: "暴雨中的维多利亚风格钟楼内部",
  genre: "奇幻悬疑",
  format: "manga_page",
  targetPages: 2,
  targetPanelsPerPage: 4,
  pace: "normal",
  visualStyle: "bw_sketch",
  analysis: null,
  pages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("Mock Generator (Demo Mode Engine)", () => {
  test("generates compliant story analysis with beats and visual pointers", () => {
    const analysis = generateMockAnalysis(testProject);
    const parsed = StoryAnalysisSchema.safeParse(analysis);
    assert.ok(parsed.success, `Analysis must conform to StoryAnalysisSchema: ${parsed.error}`);

    assert.ok(analysis.events.length > 0, "Should generate event chain");
    assert.ok(analysis.characterArcs.length >= 2, "Should include character arcs for protagonists");
    assert.ok(analysis.keyBeats.length >= 2, "Should include key dramatic beats");
    assert.ok(analysis.visualPointers.length > 0, "Should include Show, Don't Tell visual pointers");
    assert.ok(analysis.textPointers.length > 0, "Should include text pointers");
    assert.ok(analysis.pauseAndRevealMoments.length > 0, "Should include page-turn reveal pointers");
  });

  test("generates multi-page storyboard with correct page numbers and panel layout", () => {
    const pages = generateMockPages(testProject);
    assert.strictEqual(pages.length, 2, "Should match requested targetPages count");

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      assert.strictEqual(page.pageNumber, i + 1, `Page number should be ${i + 1}`);
      assert.strictEqual(page.readingOrder, "rtl", "Default format manga_page should have readingOrder rtl");
      assert.strictEqual(page.panels.length, 4, "Should have 4 panels per page");

      // Check panel numbering
      page.panels.forEach((panel, pIdx) => {
        assert.strictEqual(panel.panelNumber, pIdx + 1, "Panel numbers must be sequential 1-indexed");
        assert.ok(panel.teachingNote.alternativeShots.length >= 2, "Must provide at least 2 alternative shots");
      });

      const pageParsed = StoryboardPageSchema.safeParse(page);
      assert.ok(pageParsed.success, `Page ${i + 1} must satisfy schema: ${pageParsed.error}`);
    }
  });

  test("generates webtoon format with vertical reading order", () => {
    const webtoonProject: Project = {
      ...testProject,
      format: "webtoon",
    };
    const pages = generateMockPages(webtoonProject);
    assert.strictEqual(pages[0].readingOrder, "ttb", "Webtoon format must have readingOrder ttb");
  });

  test("regenerates single page while keeping page ID and numbering", () => {
    const page = generateMockSinglePage(testProject, 2, null, "高潮对决重构");
    assert.strictEqual(page.pageNumber, 2);
    assert.ok(page.sceneName.includes("高潮对决重构"));
    assert.ok(page.panels.length > 0);
  });

  test("regenerates single panel based on direction and maintains ID", () => {
    const pages = generateMockPages(testProject);
    const originalPanel = pages[0].panels[0];

    const updated = regenerateMockPanel(originalPanel, "改为仰视特写，增强眼神杀气");
    assert.strictEqual(updated.panelId, originalPanel.panelId, "panelId must remain untouched");
    assert.strictEqual(updated.panelNumber, originalPanel.panelNumber, "panelNumber must remain untouched");
    assert.strictEqual(updated.shotSize, "extreme_close_up", "Should adapt to close-up keyword");
    assert.strictEqual(updated.cameraAngle, "dutch_angle", "Should adapt camera angle");
    assert.ok(updated.visualDescription.includes("改为仰视特写"));

    const parsed = StoryboardPanelSchema.safeParse(updated);
    assert.ok(parsed.success, "Updated panel must satisfy schema");
  });
});
