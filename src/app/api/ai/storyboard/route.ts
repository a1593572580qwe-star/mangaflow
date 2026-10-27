import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StoryboardPageSchema, Project } from "@/types/storyboard";
import { MANGA_DIRECTOR_SYSTEM_PROMPT, STORYBOARD_GENERATION_PROMPT } from "@/lib/ai/prompts";
import { callLLMWithJson, getEffectiveApiConfig } from "@/lib/ai/client";
import { generateMockPages } from "@/lib/ai/mockGenerator";

const StoryboardOutputSchema = z.object({
  pages: z.array(StoryboardPageSchema),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, apiConfig } = body as {
      project: Project;
      apiConfig?: { baseUrl?: string; apiKey?: string; model?: string };
    };

    if (!project || typeof project.synopsis !== "string" || !project.synopsis.trim()) {
      return NextResponse.json({ error: "项目内容不能为空，请先填写故事梗概。" }, { status: 400 });
    }

    if (project.synopsis.length > 50000) {
      return NextResponse.json({ error: "故事剧情文本过长，请控制在 50,000 字以内。" }, { status: 400 });
    }

    const effectiveConfig = getEffectiveApiConfig(apiConfig);

    // If API key is not configured, run in Demo Mode
    if (!effectiveConfig.isConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockPages = generateMockPages(project, project.analysis);
      return NextResponse.json({
        pages: mockPages,
        isDemoMode: true,
        message: "当前处于演示模式：已根据故事生成结构化漫画分镜（本地未配置 STORYBOARD_API_KEY）。",
      });
    }

    const characterBrief = project.characters
      .map((c) => `- ${c.name} (${c.role}): ${c.visualTraits}，与他人关系：${c.relation}`)
      .join("\n");

    const analysisBrief = project.analysis
      ? `
【前期剧情分析参考】
- 事件链：${project.analysis.events.join(" -> ")}
- 核心节拍：${project.analysis.keyBeats.map((b) => `[${b.beatType}] ${b.title}: ${b.description}`).join("; ")}
- 画面展现建议：${project.analysis.visualPointers.join("; ")}
- 翻页悬念建议：${project.analysis.pauseAndRevealMoments.join("; ")}
`
      : "";

    const userPrompt = `
【分镜创作要求】
- 作品标题：${project.title}
- 章节：${project.chapterTitle}
- 类型：${project.genre}
- 目标总页数：${project.targetPages || 2} 页
- 每页期望格数：${project.targetPanelsPerPage || 4} 格
- 漫画格式：${project.format === "webtoon" ? "纵向条漫 (readingOrder: ttb)" : "日式分页漫画 (readingOrder: rtl)"}
- 叙事节奏：${project.pace}
- 视觉风格：${project.visualStyle === "bw_sketch" ? "黑白草稿分镜" : "彩色氛围分镜"}

【主要人物】
${characterBrief || "未指定特定角色"}

【故事剧情文本】
${project.synopsis}
${analysisBrief}

请为每一页生成具体的漫画格列表。输出必须是符合以下结构的 JSON 对象：
{
  "pages": [
    {
      "pageId": "唯一ID",
      "pageNumber": 1,
      "sceneName": "场景名称",
      "purpose": "本页叙事目的",
      "readingOrder": "${project.format === "webtoon" ? "ttb" : "rtl"}",
      "layoutTemplate": "focus_top",
      "visualFocalPoint": "本页视觉重心",
      "pageTurnSuspense": "翻页悬念说明",
      "panels": [
        {
          "panelId": "panel-1-1",
          "panelNumber": 1,
          "narrationPurpose": "本格叙事目的",
          "shotSize": "extreme_wide",
          "cameraAngle": "eye_level",
          "composition": {
            "type": "rule_of_thirds",
            "description": "构图说明",
            "focalPoint": "视觉焦点"
          },
          "characterPositions": [
            {
              "name": "人物名",
              "position": "center",
              "depth": "foreground",
              "facing": "front",
              "posture": "姿态动作"
            }
          ],
          "action": "动作描述",
          "expression": "表情神态",
          "background": "背景环境",
          "lightingAndMood": "光影氛围",
          "visualDescription": "作画者完整视觉描述",
          "textElements": [
            {
              "id": "t1",
              "speaker": "说话者",
              "content": "台词内容",
              "type": "dialogue",
              "suggestedStyle": "样式说明",
              "suggestedPosition": "top_right",
              "readingPriority": 1,
              "reason": "设计理由"
            }
          ],
          "transition": "衔接方式",
          "drawingNotes": "作画注意事项",
          "teachingNote": {
            "whyThisShot": "为什么选此景别和视角",
            "readerFocus": "希望读者首先注意什么",
            "emotionAndPacing": "如何表达情绪或推进剧情",
            "panelTransitionLogic": "与前后格衔接逻辑",
            "textVisualBalance": "台词与画面分工",
            "alternativeShots": [
              {
                "title": "方案 A",
                "shotSize": "medium",
                "cameraAngle": "low_angle",
                "composition": "构图",
                "pros": "优点",
                "cons": "缺点",
                "visualDescription": "画面描述",
                "drawingNotes": "绘制要点"
              },
              {
                "title": "方案 B",
                "shotSize": "close_up",
                "cameraAngle": "high_angle",
                "composition": "构图",
                "pros": "优点",
                "cons": "缺点",
                "visualDescription": "画面描述",
                "drawingNotes": "绘制要点"
              }
            ]
          }
        }
      ]
    }
  ]
}`;

    const { data } = await callLLMWithJson(
      [
        { role: "system", content: MANGA_DIRECTOR_SYSTEM_PROMPT },
        { role: "user", content: `${STORYBOARD_GENERATION_PROMPT}\n\n${userPrompt}` },
      ],
      StoryboardOutputSchema,
      effectiveConfig
    );

    return NextResponse.json({
      pages: data.pages,
      isDemoMode: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "分镜生成失败，请检查配置或稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
