import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { StoryboardPageSchema, StoryAnalysisSchema } from "@/types/storyboard";
import { DEMO_PROJECTS } from "@/data/demoProjects";

describe("Preset Demo Projects Integrity", () => {
  test("all demo projects have valid structure, pages, and panels", () => {
    assert.ok(DEMO_PROJECTS.length > 0, "At least one demo project must exist");

    for (const demo of DEMO_PROJECTS) {
      assert.ok(demo.id, "Demo project must have an id");
      assert.ok(demo.title, "Demo project must have a title");
      assert.ok(demo.characters.length > 0, "Demo project must define characters");
      assert.ok(demo.pages.length > 0, "Demo project must have pages");

      if (demo.analysis) {
        const analysisResult = StoryAnalysisSchema.safeParse(demo.analysis);
        assert.ok(analysisResult.success, `Analysis of ${demo.title} must be valid: ${analysisResult.error}`);
      }

      for (const page of demo.pages) {
        const pageResult = StoryboardPageSchema.safeParse(page);
        assert.ok(pageResult.success, `Page ${page.pageNumber} of ${demo.title} must pass schema validation: ${pageResult.error}`);
      }
    }
  });
});
