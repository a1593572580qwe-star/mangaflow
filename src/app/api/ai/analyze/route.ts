import { NextRequest, NextResponse } from "next/server";
import { StoryAnalysisSchema, Project } from "@/types/storyboard";
import { MANGA_DIRECTOR_SYSTEM_PROMPT, STORY_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { callLLMWithJson, getEffectiveApiConfig } from "@/lib/ai/client";
import { generateMockAnalysis } from "@/lib/ai/mockGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, apiConfig } = body as { project: Project; apiConfig?: { baseUrl?: string; apiKey?: string; model?: string } };

    if (!project || typeof project.synopsis !== "string" || !project.synopsis.trim()) {
      return NextResponse.json({ error: "项目内容不能为空，请先填写剧情梗概或故事正文。" }, { status: 400 });
    }

    if (project.synopsis.length > 50000) {
      return NextResponse.json({ error: "故事剧情文本过长，请控制在 50,000 字以内。" }, { status: 400 });
    }

    const effectiveConfig = getEffectiveApiConfig(apiConfig);

    // If API key is not configured, run in transparent Demo Mode
    if (!effectiveConfig.isConfigured) {
      // Simulate slight processing delay for realistic interaction
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockResult = generateMockAnalysis(project);
      return NextResponse.json({
        analysis: mockResult,
        isDemoMode: true,
        message: "当前处于演示模式：已根据您输入的故事内容生成高质量剧情分镜分析（本地未配置 STORYBOARD_API_KEY）。",
      });
    }

    const characterBrief = project.characters
      .map((c) => `- ${c.name} (${c.role}): ${c.visualTraits}，与他人关系：${c.relation}`)
      .join("\n");

    const userPrompt = `
【项目信息】
- 作品标题：${project.title}
- 章节：${project.chapterTitle}
- 类型：${project.genre}
- 舞台设定：${project.setting}
- 叙事节奏：${project.pace}
- 漫画格式：${project.format === "webtoon" ? "纵向条漫" : "日式分页漫画"}

【主要人物】
${characterBrief || "未指定特定角色"}

【故事剧情文本】
${project.synopsis}

请严格按照剧作与分镜导演视角，输出纯 JSON 格式的剧情前期分析。`;

    const { data: analysis } = await callLLMWithJson(
      [
        { role: "system", content: MANGA_DIRECTOR_SYSTEM_PROMPT },
        { role: "user", content: `${STORY_ANALYSIS_PROMPT}\n\n${userPrompt}` },
      ],
      StoryAnalysisSchema,
      effectiveConfig
    );

    return NextResponse.json({
      analysis,
      isDemoMode: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "剧情分析失败，请检查配置或稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
