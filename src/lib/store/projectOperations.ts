import { Project, StoryboardPage, StoryboardPanel, TextElement, LayoutTemplate } from "@/types/storyboard";

/**
 * Pure functions for Storyboard project state mutations and export utilities.
 * Used by StoryboardContext and thoroughly covered by automated test suites.
 */

/**
 * Updates a specific panel in the project, returning a new Project object without mutating the original.
 */
export function updatePanelInProject(
  project: Project,
  panelId: string,
  updates: Partial<StoryboardPanel>
): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: project.pages.map((pg) => {
      const panelIdx = pg.panels.findIndex((p) => p.panelId === panelId);
      if (panelIdx === -1) return pg;
      const updatedPanels = [...pg.panels];
      updatedPanels[panelIdx] = {
        ...updatedPanels[panelIdx],
        ...updates,
      };
      return { ...pg, panels: updatedPanels };
    }),
  };
}

/**
 * Adds a new storyboard panel to a target page, optionally inserting after a specified panelId.
 * Automatically recalculates 1-indexed panel numbers sequentially.
 */
export function addPanelToPage(
  project: Project,
  pageId: string,
  afterPanelId?: string,
  customPanel?: Partial<StoryboardPanel>
): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: project.pages.map((pg) => {
      if (pg.pageId !== pageId) return pg;
      const newPanelId = `panel-${pageId}-${Date.now()}`;
      const defaultCharacterName = project.characters[0]?.name || "角色";

      const newPanel: StoryboardPanel = {
        panelId: newPanelId,
        panelNumber: pg.panels.length + 1,
        narrationPurpose: "推进剧情发展与镜头过渡",
        shotSize: "medium",
        cameraAngle: "eye_level",
        composition: {
          type: "central",
          description: "对称平衡构图",
          focalPoint: "画面主体人物",
        },
        characterPositions: [
          {
            name: defaultCharacterName,
            position: "center",
            depth: "foreground",
            facing: "front",
            posture: "自然站立对话",
          },
        ],
        action: "角色展开下一步行动或对话回应",
        expression: "认真专注",
        background: "室内或室外环境延续",
        lightingAndMood: "自然漫射光，黑白层次丰富",
        visualDescription: "中景画面，人物进行动作或对白交互，画面构图工整平衡。",
        textElements: [
          {
            id: `txt-${Date.now()}-1`,
            speaker: defaultCharacterName,
            content: "输入对白内容...",
            type: "dialogue",
            suggestedStyle: "标准椭圆对白气泡",
            suggestedPosition: "top_right",
            readingPriority: 1,
            reason: "正常对话交流",
          },
        ],
        transition: "顺承上一格",
        drawingNotes: "注意人物与背景的空间比例",
        teachingNote: {
          whyThisShot: "采用【中景】平视镜头，保证对话与动作的信息清晰传递。",
          readerFocus: "人物上半身动作与面部微表情。",
          emotionAndPacing: "平稳推进，承上启下。",
          panelTransitionLogic: "衔接前格动作，引导读者视线自然下滑。",
          textVisualBalance: "台词与画面平衡分工。",
          alternativeShots: [
            {
              title: "方案 A：近景切入微表情",
              shotSize: "close_up",
              cameraAngle: "eye_level",
              composition: "三分法偏侧",
              pros: "情绪更饱满细腻",
              cons: "缺少身体大动作展现",
              visualDescription: "角色近景神态。",
              drawingNotes: "强调眉眼细节。",
            },
            {
              title: "方案 B：过肩反打建立空间深度",
              shotSize: "medium",
              cameraAngle: "over_the_shoulder",
              composition: "双人过肩构图",
              pros: "对话主客体空间感极强",
              cons: "构图稍微繁琐",
              visualDescription: "从同伴背后拍摄主角。",
              drawingNotes: "前景虚化肩膀处理。",
            },
          ],
        },
        ...customPanel,
      };

      let nextPanels: StoryboardPanel[];
      if (afterPanelId) {
        const insertIdx = pg.panels.findIndex((p) => p.panelId === afterPanelId);
        if (insertIdx !== -1) {
          nextPanels = [
            ...pg.panels.slice(0, insertIdx + 1),
            newPanel,
            ...pg.panels.slice(insertIdx + 1),
          ];
        } else {
          nextPanels = [...pg.panels, newPanel];
        }
      } else {
        nextPanels = [...pg.panels, newPanel];
      }

      const reindexed = nextPanels.map((p, idx) => ({ ...p, panelNumber: idx + 1 }));
      return { ...pg, panels: reindexed };
    }),
  };
}

/**
 * Deletes a storyboard panel from a page, enforcing minimum 1 panel protection.
 * Automatically recalculates 1-indexed panel numbers sequentially.
 */
export function deletePanelFromPage(
  project: Project,
  pageId: string,
  panelId: string
): { updatedProject: Project; deleted: boolean } {
  let deleted = false;
  const updatedProject: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: project.pages.map((pg) => {
      if (pg.pageId !== pageId) return pg;
      if (pg.panels.length <= 1) {
        // Enforce minimum 1 panel per page protection
        return pg;
      }
      const remaining = pg.panels.filter((p) => p.panelId !== panelId);
      if (remaining.length !== pg.panels.length) {
        deleted = true;
      }
      const reindexed = remaining.map((p, idx) => ({ ...p, panelNumber: idx + 1 }));
      return { ...pg, panels: reindexed };
    }),
  };

  return { updatedProject, deleted };
}

/**
 * Adds a new page to the project.
 */
export function addPageToProject(project: Project): Project {
  const newPageNum = project.pages.length + 1;
  const newPageId = `page-${Date.now()}-${newPageNum}`;
  const newPanelId = `panel-${newPageId}-1`;
  const defaultCharacterName = project.characters[0]?.name || "角色";

  const newPage: StoryboardPage = {
    pageId: newPageId,
    pageNumber: newPageNum,
    sceneName: `新场景·第${newPageNum}页`,
    purpose: "推进故事发展与场景转换",
    readingOrder: project.format === "webtoon" ? "ttb" : "rtl",
    layoutTemplate: "grid_4",
    visualFocalPoint: "页面对角线视觉重心",
    pageTurnSuspense: "在页尾设置翻页钩子",
    panels: [
      {
        panelId: newPanelId,
        panelNumber: 1,
        narrationPurpose: "新页面起始定场",
        shotSize: "wide",
        cameraAngle: "eye_level",
        composition: {
          type: "rule_of_thirds",
          description: "三分法空间交代",
          focalPoint: "场景主体",
        },
        characterPositions: [
          {
            name: defaultCharacterName,
            position: "center",
            depth: "foreground",
            facing: "front",
            posture: "迈步进入新空间",
          },
        ],
        action: "角色步入新环境",
        expression: "警觉或期待",
        background: "新的环境细节",
        lightingAndMood: "与前一页形成光影对比",
        visualDescription: "全景机位，展现新场景的建筑结构与人物走位。",
        textElements: [
          {
            id: `txt-${Date.now()}-1`,
            speaker: "旁白",
            content: "片刻之后——",
            type: "narration",
            suggestedStyle: "无边框条",
            suggestedPosition: "top_right",
            readingPriority: 1,
            reason: "时间或空间过渡",
          },
        ],
        transition: "切入新场景",
        drawingNotes: "注意场景连贯性",
        teachingNote: {
          whyThisShot: "采用【全景】交代新场景地理关系。",
          readerFocus: "新空间的视觉轮廓。",
          emotionAndPacing: "平稳转换视线。",
          panelTransitionLogic: "作为定场格引导后续发展。",
          textVisualBalance: "旁白极简。",
          alternativeShots: [
            {
              title: "方案 A：特写切入（直接悬疑）",
              shotSize: "close_up",
              cameraAngle: "low_angle",
              composition: "脚下步伐特写",
              pros: "动感强烈",
              cons: "空间交待较慢",
              visualDescription: "迈出的脚步近景。",
              drawingNotes: "强调地面材质。",
            },
            {
              title: "方案 B：俯视大远景（全局审视）",
              shotSize: "extreme_wide",
              cameraAngle: "high_angle",
              composition: "鸟瞰大格局",
              pros: "宏大气魄",
              cons: "人物较小",
              visualDescription: "高空俯瞰建筑全景。",
              drawingNotes: "绘制透视线网格。",
            },
          ],
        },
      },
    ],
  };

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: [...project.pages, newPage],
  };
}

/**
 * Deletes a page from the project, enforcing minimum 1 page protection.
 */
export function deletePageFromProject(
  project: Project,
  pageId: string
): { updatedProject: Project; deleted: boolean } {
  if (project.pages.length <= 1) {
    return { updatedProject: project, deleted: false };
  }

  const remaining = project.pages.filter((p) => p.pageId !== pageId);
  const reindexed = remaining.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

  return {
    updatedProject: {
      ...project,
      updatedAt: new Date().toISOString(),
      pages: reindexed,
    },
    deleted: true,
  };
}

/**
 * Adds a text element to a specific panel.
 */
export function addTextElementToPanel(
  project: Project,
  panelId: string,
  element?: Partial<TextElement>
): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: project.pages.map((pg) => {
      const panelIdx = pg.panels.findIndex((p) => p.panelId === panelId);
      if (panelIdx === -1) return pg;
      const panel = pg.panels[panelIdx];
      const existingTexts = panel.textElements || [];
      const newElement: TextElement = {
        id: `txt-${Date.now()}-${existingTexts.length + 1}`,
        speaker: element?.speaker || project.characters[0]?.name || "角色",
        content: element?.content || "新增对白内容",
        type: element?.type || "dialogue",
        suggestedStyle: element?.suggestedStyle || "标准椭圆气泡",
        suggestedPosition: element?.suggestedPosition || "top_right",
        readingPriority: existingTexts.length + 1,
        reason: element?.reason || "补充角色对白或台词",
      };
      const updatedPanel = {
        ...panel,
        textElements: [...existingTexts, newElement],
      };
      const newPanels = [...pg.panels];
      newPanels[panelIdx] = updatedPanel;
      return { ...pg, panels: newPanels };
    }),
  };
}

/**
 * Deletes a text element from a specific panel.
 */
export function deleteTextElementFromPanel(
  project: Project,
  panelId: string,
  textId: string
): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: project.pages.map((pg) => {
      const panelIdx = pg.panels.findIndex((p) => p.panelId === panelId);
      if (panelIdx === -1) return pg;
      const panel = pg.panels[panelIdx];
      const remaining = (panel.textElements || []).filter((txt) => txt.id !== textId);
      const newPanels = [...pg.panels];
      newPanels[panelIdx] = { ...panel, textElements: remaining };
      return { ...pg, panels: newPanels };
    }),
  };
}

/**
 * Generates structured Markdown screenplay export from a Project.
 */
export function generateMarkdown(proj: Project): string {
  let md = `# ${proj.title} - 分镜脚本\n\n`;
  md += `> **章节**：${proj.chapterTitle}  \n`;
  md += `> **类型**：${proj.genre} | **格式**：${proj.format === "webtoon" ? "纵向条漫" : "日式分页漫画"} | **节奏**：${proj.pace}  \n`;
  md += `> **舞台背景**：${proj.setting}  \n\n`;

  md += `## 剧情梗概\n${proj.synopsis}\n\n`;

  md += `## 核心出场人物\n`;
  (proj.characters || []).forEach((c) => {
    md += `- **${c.name}**（${c.role}）：${c.visualTraits}。人物关系：${c.relation}\n`;
  });
  md += `\n---\n\n`;

  if (proj.analysis) {
    md += `## 导演剧作分析\n`;
    md += `### 事件因果链\n`;
    (proj.analysis.events || []).forEach((ev, i) => {
      md += `${i + 1}. ${ev}\n`;
    });
    md += `\n### 导演全局建议\n${proj.analysis.narrativeAdvice || ""}\n\n---\n\n`;
  }

  md += `## 分页分镜稿\n\n`;
  (proj.pages || []).forEach((page) => {
    md += `### 第 ${page.pageNumber} 页：${page.sceneName}\n`;
    md += `- **本页目的**：${page.purpose}\n`;
    md += `- **阅读顺序**：${page.readingOrder === "rtl" ? "从右向左 (日式)" : "从上至下 (条漫)"} | **布局版式**：${page.layoutTemplate}\n`;
    md += `- **视觉重心**：${page.visualFocalPoint}\n`;
    md += `- **翻页悬念 (Page-turner)**：${page.pageTurnSuspense}\n\n`;

    (page.panels || []).forEach((p) => {
      md += `#### 【第 ${p.panelNumber} 格】 ${p.shotSize} · ${p.cameraAngle}\n`;
      md += `- **叙事目的**：${p.narrationPurpose}\n`;
      if (p.composition) {
        md += `- **构图重点**：${p.composition.description}（视觉焦点：${p.composition.focalPoint}）\n`;
      }
      if (p.characterPositions && p.characterPositions.length > 0) {
        md += `- **人物站位**：${p.characterPositions.map((c) => `${c.name}位于${c.position}(${c.depth}, 朝向${c.facing})`).join("；")}\n`;
      }
      md += `- **动作与瞬间**：${p.action}\n`;
      md += `- **神态表情**：${p.expression}\n`;
      md += `- **光影氛围**：${p.lightingAndMood}\n`;
      md += `- **画面描述（供绘师）**：${p.visualDescription}\n`;

      const texts = p.textElements || [];
      if (texts.length > 0) {
        md += `- **台词与音效**：\n`;
        texts.forEach((t) => {
          md += `  * [${t.type}] **${t.speaker}**：“${t.content}” （位置：${t.suggestedPosition}，样式：${t.suggestedStyle}，理由：${t.reason}）\n`;
        });
      }

      md += `- **衔接方式**：${p.transition}\n`;
      md += `- **绘制提示**：${p.drawingNotes}\n`;
      if (p.teachingNote) {
        md += `- **导演教学说明**：${p.teachingNote.whyThisShot}（读者焦点：${p.teachingNote.readerFocus}）\n\n`;
      }
    });

    md += `\n---\n\n`;
  });

  return md;
}

/**
 * Validates a JSON payload intended for project import.
 */
export function validateProjectJson(jsonStr: string): { success: true; project: Project } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonStr) as Project;
    if (!parsed || typeof parsed !== "object") {
      return { success: false, error: "导入内容不是有效的 JSON 对象。" };
    }
    if (!parsed.id || typeof parsed.id !== "string") {
      return { success: false, error: "缺少必需的项目 ID (id)。" };
    }
    if (!parsed.title || typeof parsed.title !== "string") {
      return { success: false, error: "缺少必需的项目标题 (title)。" };
    }
    if (!Array.isArray(parsed.pages)) {
      return { success: false, error: "缺少必需的页面列表 (pages)。" };
    }
    return { success: true, project: parsed };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "无效的 JSON 格式。" };
  }
}
