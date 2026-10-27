import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Project, StoryboardPanel, TextElement } from "@/types/storyboard";
import { DEMO_PROJECTS } from "@/data/demoProjects";
import {
  updatePanelInProject,
  addPanelToPage,
  deletePanelFromPage,
  addPageToProject,
  deletePageFromProject,
  addTextElementToPanel,
  deleteTextElementFromPanel,
  generateMarkdown,
  validateProjectJson,
} from "@/lib/store/projectOperations";

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

describe("Project Operations and State Invariants (Real Implementation)", () => {
  const baseProject = clone(DEMO_PROJECTS[0]);

  test("single panel modification isolation: editing panel A does not touch panel B or other pages", () => {
    const page1 = baseProject.pages[0];
    assert.ok(page1.panels.length >= 2, "Demo project must have at least 2 panels in page 1");

    const targetPanelId = page1.panels[0].panelId;
    const untouchedPanelId = page1.panels[1].panelId;
    const untouchedPanelOriginal = clone(page1.panels[1]);

    const updatedProject = updatePanelInProject(baseProject, targetPanelId, {
      shotSize: "extreme_close_up",
      action: "全新动作测试",
    });

    const updatedPage1 = updatedProject.pages[0];
    const updatedTarget = updatedPage1.panels.find((p) => p.panelId === targetPanelId)!;
    const updatedUntouched = updatedPage1.panels.find((p) => p.panelId === untouchedPanelId)!;

    assert.strictEqual(updatedTarget.shotSize, "extreme_close_up");
    assert.strictEqual(updatedTarget.action, "全新动作测试");

    // Verify isolation
    assert.deepStrictEqual(updatedUntouched, untouchedPanelOriginal, "Untouched panel must remain identical");
    assert.deepStrictEqual(updatedProject.pages[1], baseProject.pages[1], "Other pages must remain identical");
  });

  test("panel addition inserts at correct index and re-indexes panel numbers sequentially", () => {
    const page1 = baseProject.pages[0];
    const originalCount = page1.panels.length;
    const firstPanelId = page1.panels[0].panelId;

    // Insert after first panel
    const updated = addPanelToPage(baseProject, page1.pageId, firstPanelId);
    const updatedPanels = updated.pages[0].panels;

    assert.strictEqual(updatedPanels.length, originalCount + 1);
    assert.strictEqual(updatedPanels[0].panelId, firstPanelId);
    assert.strictEqual(updatedPanels[0].panelNumber, 1);
    assert.strictEqual(updatedPanels[1].panelNumber, 2);
    assert.strictEqual(updatedPanels[2].panelNumber, 3);
  });

  test("panel deletion removes target panel and preserves 1-indexed numbering", () => {
    const page1 = baseProject.pages[0];
    const deleteId = page1.panels[1].panelId;
    const originalCount = page1.panels.length;

    const { updatedProject: updated, deleted } = deletePanelFromPage(baseProject, page1.pageId, deleteId);
    assert.strictEqual(deleted, true);
    const updatedPanels = updated.pages[0].panels;

    assert.strictEqual(updatedPanels.length, originalCount - 1);
    assert.ok(!updatedPanels.some((p) => p.panelId === deleteId));
    updatedPanels.forEach((p, idx) => {
      assert.strictEqual(p.panelNumber, idx + 1, "Panel numbers must be consecutively 1-indexed");
    });
  });

  test("minimum 1 panel per page protection", () => {
    // Attempting to delete when only 1 panel exists should do nothing
    const singlePanelPageProject: Project = {
      ...baseProject,
      pages: [
        {
          ...baseProject.pages[0],
          panels: [baseProject.pages[0].panels[0]],
        },
      ],
    };

    const targetPageId = singlePanelPageProject.pages[0].pageId;
    const targetPanelId = singlePanelPageProject.pages[0].panels[0].panelId;

    const { updatedProject: result, deleted } = deletePanelFromPage(singlePanelPageProject, targetPageId, targetPanelId);
    assert.strictEqual(deleted, false, "Should indicate panel was not deleted");
    assert.strictEqual(result.pages[0].panels.length, 1, "Should not delete last panel on page");
  });

  test("page addition and deletion with 1-page minimum protection", () => {
    const added = addPageToProject(baseProject);
    assert.strictEqual(added.pages.length, baseProject.pages.length + 1);
    const newPage = added.pages[added.pages.length - 1];
    assert.strictEqual(newPage.pageNumber, added.pages.length);
    assert.strictEqual(newPage.panels.length, 1);

    // Delete newly added page
    const { updatedProject: afterDelete, deleted: deletedSuccess } = deletePageFromProject(added, newPage.pageId);
    assert.strictEqual(deletedSuccess, true);
    assert.strictEqual(afterDelete.pages.length, baseProject.pages.length);

    // Attempt to delete down to 0 pages on a single-page project
    const singlePageProj: Project = {
      ...baseProject,
      pages: [baseProject.pages[0]],
    };
    const { updatedProject: protectedProj, deleted: deletedFailed } = deletePageFromProject(
      singlePageProj,
      singlePageProj.pages[0].pageId
    );
    assert.strictEqual(deletedFailed, false);
    assert.strictEqual(protectedProj.pages.length, 1, "Must maintain at least 1 page");
  });

  test("text elements management: adds and deletes text elements cleanly", () => {
    const project = clone(baseProject);
    const targetPanel = project.pages[0].panels[0];

    const element: Partial<TextElement> = {
      speaker: "林澈",
      content: "你为什么会在这？",
      type: "dialogue",
      suggestedStyle: "圆形气泡",
      suggestedPosition: "top_right",
      reason: "疑问语气",
    };

    const updated = addTextElementToPanel(project, targetPanel.panelId, element);
    const updatedPanel = updated.pages[0].panels[0];
    const newElement = updatedPanel.textElements[updatedPanel.textElements.length - 1];

    assert.strictEqual(newElement.speaker, "林澈");
    assert.strictEqual(newElement.content, "你为什么会在这？");
    assert.strictEqual(newElement.type, "dialogue");

    // Delete the newly added element
    const afterDelete = deleteTextElementFromPanel(updated, targetPanel.panelId, newElement.id);
    const afterDeletePanel = afterDelete.pages[0].panels[0];
    assert.ok(!afterDeletePanel.textElements.some((t) => t.id === newElement.id));
  });

  test("Markdown export contains expected sections, characters and teaching notes", () => {
    const md = generateMarkdown(baseProject);
    assert.ok(md.includes(`# ${baseProject.title} - 分镜脚本`));
    assert.ok(md.includes("## 核心出场人物"));
    assert.ok(md.includes("## 分页分镜稿"));
    assert.ok(md.includes("### 第 1 页"));
    assert.ok(md.includes("【第 1 格】"));
    assert.ok(md.includes("从右向左 (日式)"));
    assert.ok(md.includes("导演剧作分析"));
    assert.ok(md.includes("导演教学说明"));
  });

  test("JSON export and import roundtrip preserves all fields and structures", () => {
    const exportedJson = JSON.stringify(baseProject, null, 2);
    assert.ok(exportedJson.length > 0);

    const validation = validateProjectJson(exportedJson);
    assert.strictEqual(validation.success, true);
    if (validation.success) {
      assert.strictEqual(validation.project.id, baseProject.id);
      assert.strictEqual(validation.project.title, baseProject.title);
      assert.strictEqual(validation.project.pages.length, baseProject.pages.length);
      assert.deepStrictEqual(validation.project, baseProject);
    }
  });

  test("JSON import validation handles corrupted, malformed and incomplete payloads", () => {
    // Missing required fields
    const invalidJsonStr = JSON.stringify({ something: "else" });
    const resMissing = validateProjectJson(invalidJsonStr);
    assert.strictEqual(resMissing.success, false);
    if (!resMissing.success) {
      assert.ok(resMissing.error.includes("id") || resMissing.error.includes("title"));
    }

    // Missing pages
    const missingPages = JSON.stringify({ id: "p1", title: "测试" });
    const resPages = validateProjectJson(missingPages);
    assert.strictEqual(resPages.success, false);

    // Syntax error in JSON string
    const resSyntax = validateProjectJson("not a valid json {{{{");
    assert.strictEqual(resSyntax.success, false);
  });

  test("persistence simulation: localStorage save and restore roundtrip", () => {
    const simulatedStorage = new Map<string, string>();

    // Save
    simulatedStorage.set("mangaflow_projects_v1", JSON.stringify([baseProject]));
    simulatedStorage.set("mangaflow_active_project_id_v1", baseProject.id);

    // Restore
    const savedProjects = simulatedStorage.get("mangaflow_projects_v1");
    const savedActiveId = simulatedStorage.get("mangaflow_active_project_id_v1");

    assert.ok(savedProjects);
    const restoredProjects = JSON.parse(savedProjects) as Project[];
    assert.strictEqual(restoredProjects.length, 1);
    assert.strictEqual(restoredProjects[0].id, savedActiveId);
    assert.strictEqual(restoredProjects[0].title, baseProject.title);
  });
});
