import { NextRequest, NextResponse } from "next/server";
import { StoryboardPanelSchema, StoryboardPanel } from "@/types/storyboard";
import { MANGA_DIRECTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { callLLMWithJson, getEffectiveApiConfig } from "@/lib/ai/client";
import { regenerateMockPanel } from "@/lib/ai/mockGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      panel,
      instruction,
      context,
      apiConfig,
    } = body as {
      panel: StoryboardPanel;
      instruction: string;
      context?: {
        projectTitle?: string;
        sceneName?: string;
        prevPanelSummary?: string;
        nextPanelSummary?: string;
      };
      apiConfig?: { baseUrl?: string; apiKey?: string; model?: string };
    };

    if (!panel || !panel.panelId) {
      return NextResponse.json({ error: "必须提供有效的漫画格数据（缺少 panelId）。" }, { status: 400 });
    }

    if (instruction && instruction.length > 2000) {
      return NextResponse.json({ error: "微调指令过长，请控制在 2,000 字以内。" }, { status: 400 });
    }

    const effectiveConfig = getEffectiveApiConfig(apiConfig);

    // Demo Mode handling
    if (!effectiveConfig.isConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const modifiedPanel = regenerateMockPanel(panel, instruction || "优化视觉表现与情绪张力");
      return NextResponse.json({
        panel: modifiedPanel,
        isDemoMode: true,
        message: "当前处于演示模式：已根据修改指令调整漫画格（本地未配置 STORYBOARD_API_KEY）。",
      });
    }

    const userPrompt = `
【上下文环境】
- 作品标题：${context?.projectTitle || "未知"}
- 当前场景：${context?.sceneName || "当前场景"}
- 前一格简要：${context?.prevPanelSummary || "（无或开篇）"}
- 后一格简要：${context?.nextPanelSummary || "（无或页尾）"}

【原漫画格数据 (JSON)】
${JSON.stringify(panel, null, 2)}

【创作者修改指令】
${instruction}

【修改要求】
1. 严格针对创作者指令进行专业分镜修正。
2. 保持 panelId 与 panelNumber 不变，避免破坏与前后格的上下文关联。
3. 重新推导视觉描述、构图、景别、视角、台词、绘制提示以及专业教学说明（teachingNote）和2种新的备选方案。
4. 输出必须是符合 StoryboardPanel 结构的单一 JSON 对象。`;

    const { data: updatedPanel } = await callLLMWithJson(
      [
        { role: "system", content: MANGA_DIRECTOR_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      StoryboardPanelSchema,
      effectiveConfig
    );

    const sanitizedPanel = {
      ...updatedPanel,
      panelId: panel.panelId,
      panelNumber: panel.panelNumber,
    };

    return NextResponse.json({
      panel: sanitizedPanel,
      isDemoMode: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "漫画格更新失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
