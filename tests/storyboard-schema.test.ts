import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  StoryboardPanelSchema,
  StoryboardPageSchema,
  StoryAnalysisSchema,
  TextElementSchema,
  AlternativeShotSchema,
  TeachingNoteSchema,
} from "@/types/storyboard";

describe("Storyboard Data Schema Validation", () => {
  test("validates all 8 comic text element types", () => {
    const textTypes = [
      "dialogue",
      "offPanelDialogue",
      "narration",
      "innerMonologue",
      "thought",
      "sfx",
      "whisper",
      "shout",
    ] as const;

    for (const type of textTypes) {
      const element = {
        id: `t-${type}`,
        speaker: type === "sfx" ? "环境声" : "角色A",
        content: "测试台词或音效内容",
        type,
        suggestedStyle: "默认气泡",
        suggestedPosition: "top_right",
        readingPriority: 1,
        reason: "测试理由",
      };
      const result = TextElementSchema.safeParse(element);
      assert.ok(result.success, `TextElementType '${type}' should be valid`);
    }

    // Invalid text type should fail
    const invalidElement = {
      id: "t-invalid",
      speaker: "角色",
      content: "内容",
      type: "invalid_type",
      suggestedStyle: "样式",
      suggestedPosition: "top_right",
      readingPriority: 1,
      reason: "理由",
    };
    const invalidResult = TextElementSchema.safeParse(invalidElement);
    assert.strictEqual(invalidResult.success, false);
  });

  test("validates shot sizes and camera angles", () => {
    const shotSizes = [
      "extreme_wide",
      "wide",
      "medium",
      "close_up",
      "extreme_close_up",
      "detail",
    ] as const;

    const cameraAngles = [
      "eye_level",
      "low_angle",
      "high_angle",
      "dutch_angle",
      "over_the_shoulder",
      "birds_eye",
    ] as const;

    for (const shotSize of shotSizes) {
      for (const cameraAngle of cameraAngles) {
        const alt = {
          title: "备选方案",
          shotSize,
          cameraAngle,
          composition: "居中构图",
          pros: "优点",
          cons: "缺点",
          visualDescription: "画面描述",
          drawingNotes: "作画笔记",
        };
        const result = AlternativeShotSchema.safeParse(alt);
        assert.ok(result.success, `Combination ${shotSize} + ${cameraAngle} should be valid`);
      }
    }
  });

  test("validates storyboard panel and teaching note completeness", () => {
    const samplePanel = {
      panelId: "p-test-1",
      panelNumber: 1,
      narrationPurpose: "交代开场背景",
      shotSize: "extreme_wide",
      cameraAngle: "eye_level",
      composition: {
        type: "rule_of_thirds",
        description: "三分法构图",
        focalPoint: "主角剪影",
      },
      characterPositions: [
        {
          name: "主角",
          position: "center",
          depth: "foreground",
          facing: "front",
          posture: "静止站立",
        },
      ],
      action: "凝望远方地平线",
      expression: "沉思",
      background: "黄昏废墟",
      lightingAndMood: "斜阳逆光，高对比度",
      visualDescription: "供画师参考的完整画面描述",
      textElements: [
        {
          id: "txt-1",
          speaker: "旁白",
          content: "一切从那个黄昏开始。",
          type: "narration",
          suggestedStyle: "横幅旁白条",
          suggestedPosition: "top_right",
          readingPriority: 1,
          reason: "交代开幕情境",
        },
      ],
      transition: "顺承下一格",
      drawingNotes: "注意空气透视",
      teachingNote: {
        whyThisShot: "大远景交代环境规模",
        readerFocus: "画框正中的主角微小身影",
        emotionAndPacing: "沉静开场",
        panelTransitionLogic: "作为定场镜头引入人物",
        textVisualBalance: "极简旁白，留白充足",
        alternativeShots: [
          {
            title: "方案A",
            shotSize: "close_up",
            cameraAngle: "low_angle",
            composition: "仰视特写",
            pros: "情绪强",
            cons: "缺环境",
            visualDescription: "面部特写",
            drawingNotes: "眼神光",
          },
        ],
      },
    };

    const result = StoryboardPanelSchema.safeParse(samplePanel);
    assert.ok(result.success, "Valid StoryboardPanel should pass validation");

    // Missing teachingNote should fail
    const { teachingNote, ...missingNote } = samplePanel;
    const failResult = StoryboardPanelSchema.safeParse(missingNote);
    assert.strictEqual(failResult.success, false);
  });

  test("validates readingOrder options: rtl (Japanese manga) and ttb (webtoon)", () => {
    const basePage = {
      pageId: "page-1",
      pageNumber: 1,
      sceneName: "序章",
      purpose: "开场",
      layoutTemplate: "focus_top",
      visualFocalPoint: "顶部大画格",
      pageTurnSuspense: "翻页悬念",
      panels: [],
    };

    const rtlPage = { ...basePage, readingOrder: "rtl" };
    const ttbPage = { ...basePage, readingOrder: "ttb" };
    const ltrPage = { ...basePage, readingOrder: "ltr" };
    const invalidPage = { ...basePage, readingOrder: "diagonal" };

    assert.ok(StoryboardPageSchema.safeParse(rtlPage).success);
    assert.ok(StoryboardPageSchema.safeParse(ttbPage).success);
    assert.ok(StoryboardPageSchema.safeParse(ltrPage).success);
    assert.strictEqual(StoryboardPageSchema.safeParse(invalidPage).success, false);
  });
});
