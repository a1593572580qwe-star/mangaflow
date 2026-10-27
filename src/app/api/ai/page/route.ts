import { NextRequest, NextResponse } from "next/server";
import { StoryboardPageSchema, Project } from "@/types/storyboard";
import { MANGA_DIRECTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { callLLMWithJson, getEffectiveApiConfig } from "@/lib/ai/client";
import { generateMockSinglePage } from "@/lib/ai/mockGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, pageId, pageNumber, instruction, apiConfig } = body as {
      project: Project;
      pageId: string;
      pageNumber: number;
      instruction?: string;
      apiConfig?: { baseUrl?: string; apiKey?: string; model?: string };
    };

    if (!project || typeof project.synopsis !== "string" || !project.synopsis.trim()) {
      return NextResponse.json({ error: "项目内容不能为空，请先填写故事梗概。" }, { status: 400 });
    }

    if (project.synopsis.length > 50000) {
      return NextResponse.json({ error: "故事剧情文本过长，请控制在 50,000 字以内。" }, { status: 400 });
    }

    if (instruction && instruction.length > 2000) {
      return NextResponse.json({ error: "修改指令过长，请控制在 2,000 字以内。" }, { status: 400 });
    }

    const effectiveConfig = getEffectiveApiConfig(apiConfig);

    // If API key is not configured, run in Demo Mode
    if (!effectiveConfig.isConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockPage = generateMockSinglePage(
        project,
        pageNumber || 1,
        project.analysis,
        instruction
      );
      if (pageId) {
        mockPage.pageId = pageId;
      }
      return NextResponse.json({
        page: mockPage,
        isDemoMode: true,
        message: `当前处于演示模式：已重新生成第 ${pageNumber || 1} 页分镜（本地未配置 STORYBOARD_API_KEY）。`,
      });
    }

    const characterBrief = project.characters
      .map((c) => `- ${c.name} (${c.role}): ${c.visualTraits}，与他人关系：${c.relation}`)
      .join("\n");

    const userPrompt = `
【单页分镜重构任务】
- 作品标题：${project.title}
- 章节：${project.chapterTitle}
- 当前重构页码：第 ${pageNumber} 页
- 漫画格式：${project.format === "webtoon" ? "纵向条漫 (readingOrder: ttb)" : "日式分页漫画 (readingOrder: rtl)"}
- 叙事节奏：${project.pace}
- 期望画格数：${project.targetPanelsPerPage || 4} 格
- 导演重构指令：${instruction || "重新优化本页分镜节奏，增强镜头语言与悬念"}

【主要人物】
${characterBrief || "未指定特定角色"}

【故事剧情文本】
${project.synopsis}

【要求】
仅生成符合第 ${pageNumber} 页情节的单一漫画页（StoryboardPage）JSON 对象，包含完整的画格列表、镜头设计、台词音效与教学笔记。pageId 设置为 "${pageId || `page-${pageNumber}`}"，pageNumber 为 ${pageNumber}。`;

    const { data: page } = await callLLMWithJson(
      [
        { role: "system", content: MANGA_DIRECTOR_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      StoryboardPageSchema,
      effectiveConfig
    );

    const sanitizedPage = {
      ...page,
      ...(pageId ? { pageId } : {}),
      ...(pageNumber ? { pageNumber } : {}),
    };

    return NextResponse.json({
      page: sanitizedPage,
      isDemoMode: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "单页分镜生成失败。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
