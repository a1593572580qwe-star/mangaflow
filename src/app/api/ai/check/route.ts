import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Project } from "@/types/storyboard";
import { callLLMWithJson, getEffectiveApiConfig } from "@/lib/ai/client";

const ContinuityReportSchema = z.object({
  score: z.number().min(0).max(100),
  overallAssessment: z.string(),
  continuityIssues: z.array(
    z.object({
      location: z.string(), // 例如: "第1页第3格 -> 第4格"
      severity: z.enum(["high", "medium", "low"]),
      issueType: z.enum(["axis_jump", "repetition", "dialogue_gap", "pacing_drag", "spatial_confusion"]),
      description: z.string(),
      suggestion: z.string(),
    })
  ),
  shotVarietyScore: z.string(),
  pacingPraise: z.string(),
  actionableImprovements: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project, apiConfig } = body as {
      project: Project;
      apiConfig?: { baseUrl?: string; apiKey?: string; model?: string };
    };

    if (!project || !project.pages || project.pages.length === 0) {
      return NextResponse.json({ error: "项目尚无分镜页面，无法进行连贯性审查。" }, { status: 400 });
    }

    const effectiveConfig = getEffectiveApiConfig(apiConfig);

    // Rule-based inspection for Demo Mode
    if (!effectiveConfig.isConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const totalPanels = project.pages.reduce((acc, p) => acc + p.panels.length, 0);
      const shots = project.pages.flatMap((p) => p.panels.map((panel) => panel.shotSize));
      const hasCloseUp = shots.includes("close_up") || shots.includes("extreme_close_up");
      const hasWide = shots.includes("wide") || shots.includes("extreme_wide");

      return NextResponse.json({
        report: {
          score: 92,
          overallAssessment: `当前分镜结构完整，共计 ${project.pages.length} 页、${totalPanels} 格。景别梯度自然，动静结合得当，翻页悬念设置明确。`,
          continuityIssues: [
            {
              location: "第1页末格",
              severity: "low",
              issueType: "spatial_confusion",
              description: "翻页前的视线交汇较强，作画时需确保左右站位轴线（180度规则）在第2页首格保持一致，避免视线方向反向穿帮。",
              suggestion: "在绘制笔记中显式标明角色视线朝向（如林澈面向右侧，苏晓晴面向左侧）。",
            },
            {
              location: "全篇节奏",
              severity: "low",
              issueType: "pacing_drag",
              description: "部分格子的台词较长，阅读耗时可能稍微拉慢动作画面的冲击感。",
              suggestion: "建议将长句对白拆解为两个分段气泡，或者将其中一部分转为无声动作表现。",
            },
          ],
          shotVarietyScore: hasCloseUp && hasWide ? "优秀（兼具大景别空间交代与极近情绪特写）" : "良好",
          pacingPraise: "日式分页自右向左的视线流向把握严密，每页末尾均设计了强有力的翻页钩子。",
          actionableImprovements: [
            "可适当增加环境空镜的留白格，给读者心境沉淀的时间",
            "检查拟声词字号是否与动作烈度相匹配",
            "确保各人物在不同格中的服装与标志性道具特征完全一致",
          ],
        },
        isDemoMode: true,
      });
    }

    const simpleProjectDigest = {
      title: project.title,
      synopsis: project.synopsis,
      pages: project.pages.map((p) => ({
        pageNumber: p.pageNumber,
        sceneName: p.sceneName,
        readingOrder: p.readingOrder,
        panels: p.panels.map((pn) => ({
          panelNumber: pn.panelNumber,
          shotSize: pn.shotSize,
          cameraAngle: pn.cameraAngle,
          action: pn.action,
          characters: pn.characterPositions.map((c) => `${c.name}@${c.position}(${c.facing})`).join(", "),
          dialogue: pn.textElements.map((t) => `[${t.type}] ${t.speaker}: ${t.content}`).join("; "),
        })),
      })),
    };

    const userPrompt = `
请以资深漫画总监视角，对以下漫画分镜进行全篇连贯性与专业度审查：
${JSON.stringify(simpleProjectDigest, null, 2)}

请审查以下维度：
1. 空间与视线轴线（180度规则）是否违背？人物站位是否跳轴穿帮？
2. 镜头景别是否存在单调重复（连续3格同景别或缺少大远景空间交代）？
3. 原著故事的重要剧情和台词是否遗漏？
4. 节奏推进是否过快或拖沓？
5. 输出必须严格符合 ContinuityReportSchema 的 JSON 格式。`;

    const { data: report } = await callLLMWithJson(
      [
        {
          role: "system",
          content: "你是一名严苛的日本顶级漫画总监（Comic Editor-in-Chief），专门负责审查分镜稿的连贯性、轴线和视觉节奏。",
        },
        { role: "user", content: userPrompt },
      ],
      ContinuityReportSchema,
      effectiveConfig
    );

    return NextResponse.json({
      report,
      isDemoMode: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "连贯性检查失败。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
