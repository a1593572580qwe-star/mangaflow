"use client";

import React, { useState } from "react";
import { StoryboardPage, StoryboardPanel, LayoutTemplate } from "@/types/storyboard";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { PanelWireframe } from "@/components/canvas/PanelWireframe";
import { SHOT_SIZE_LABELS, CAMERA_ANGLE_LABELS } from "@/lib/utils/mangaLabels";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Layout,
  RotateCw,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  CornerDownRight,
  BookOpen,
} from "lucide-react";

interface PageCanvasProps {
  page: StoryboardPage;
  pageIndex: number;
}

export function PageCanvas({ page, pageIndex }: PageCanvasProps) {
  const {
    selectedPanelId,
    setSelectedPanelId,
    movePanel,
    deletePanel,
    addPanel,
    changePageLayout,
    showFlowArrows,
    activeProject,
    regeneratePage,
  } = useStoryboard();

  const [isRegeneratingPage, setIsRegeneratingPage] = useState(false);
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);
  const [pageRegenInstruction, setPageRegenInstruction] = useState("");

  const isRtl = page.readingOrder === "rtl" && activeProject.format !== "webtoon";
  const isWebtoon = activeProject.format === "webtoon";

  // Grid styling based on layoutTemplate
  const getLayoutClasses = (template: LayoutTemplate, panelCount: number) => {
    if (isWebtoon) {
      return "flex flex-col gap-5";
    }

    switch (template) {
      case "focus_top":
      case "focus_bottom":
        return "grid grid-cols-2 gap-3 min-h-[580px]";
      case "split_horizontal":
        return "grid grid-cols-1 gap-3 min-h-[580px]";
      case "dynamic_action":
        return "grid grid-cols-3 gap-3 min-h-[580px]";
      case "grid_4":
      default:
        return "grid grid-cols-2 gap-3 min-h-[580px]";
    }
  };

  // Panel sizing classes inside the layout
  const getPanelGridClasses = (
    template: LayoutTemplate,
    panelIdx: number,
    totalPanels: number
  ) => {
    if (isWebtoon) {
      return "w-full min-h-[220px]";
    }

    switch (template) {
      case "focus_top":
        if (panelIdx === 0) return "col-span-2 min-h-[240px]";
        if (totalPanels === 4 && panelIdx === 3) return "col-span-2 min-h-[240px]";
        return "col-span-1 min-h-[200px]";
      case "focus_bottom":
        if (panelIdx === totalPanels - 1) return "col-span-2 min-h-[240px]";
        if (totalPanels === 4 && panelIdx === 0) return "col-span-2 min-h-[220px]";
        return "col-span-1 min-h-[200px]";
      case "split_horizontal":
        return "col-span-1 min-h-[180px]";
      case "dynamic_action":
        if (panelIdx === 0) return "col-span-2 min-h-[240px]";
        if (panelIdx === 1) return "col-span-1 min-h-[240px]";
        return "col-span-1 min-h-[190px]";
      case "grid_4":
      default:
        return "col-span-1 min-h-[220px]";
    }
  };

  const handleDoRegeneratePage = async () => {
    setIsRegeneratingPage(true);
    setShowRegenPrompt(false);
    try {
      const res = await regeneratePage(page.pageId, pageRegenInstruction.trim() || undefined);
      if (!res.success) {
        alert(res.error || "本页重构失败");
      }
      setPageRegenInstruction("");
    } finally {
      setIsRegeneratingPage(false);
    }
  };

  return (
    <div className="relative bg-white border-2 border-ink-950 p-6 md:p-8 shadow-manga-lg max-w-4xl mx-auto my-6 text-ink-950">
      {/* Registration Marks / 蜻蜓标 (Authentic Japanese Manga Paper Trim Guides) */}
      <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-ink-400 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-ink-400 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-ink-400 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-ink-400 pointer-events-none" />

      {/* Page Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-ink-950 pb-3 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="bg-ink-950 text-paper-50 px-2 py-0.5 font-bold font-mono text-xs">
            PAGE {page.pageNumber}
          </span>
          <span className="font-bold text-sm tracking-wide font-manga text-ink-950">
            {page.sceneName}
          </span>
          <span className="text-[11px] text-ink-500 font-mono hidden md:inline">
            目的：{page.purpose}
          </span>
        </div>

        {/* Layout Template Switcher & Page Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-ink-300 bg-paper-50 px-2 py-1 text-xs">
            <Layout className="w-3.5 h-3.5 text-ink-600" />
            <select
              value={page.layoutTemplate}
              onChange={(e) => changePageLayout(page.pageId, e.target.value as LayoutTemplate)}
              className="bg-transparent font-bold text-xs text-ink-900 focus:outline-none"
            >
              <option value="focus_top">顶部大格 + 下部多格</option>
              <option value="focus_bottom">铺垫分格 + 底部大格爆点</option>
              <option value="grid_4">均衡经典四格 (4-Koma)</option>
              <option value="dynamic_action">倾斜动感斜切格</option>
              <option value="split_horizontal">宽幅横向三段式</option>
              {isWebtoon && <option value="vertical_strip">纵向条漫单列</option>}
            </select>
          </div>

          {/* Regenerate This Page Button */}
          <button
            onClick={() => setShowRegenPrompt(true)}
            disabled={isRegeneratingPage}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-ink-950 text-ink-950 hover:bg-paper-100 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            title="重新生成本页分镜（不影响其他页面）"
          >
            <RotateCw className={`w-3 h-3 ${isRegeneratingPage ? "animate-spin" : ""}`} />
            <span>{isRegeneratingPage ? "重构中..." : "重构本页"}</span>
          </button>

          <button
            onClick={() => addPanel(page.pageId)}
            className="flex items-center gap-1 px-2.5 py-1 bg-ink-950 text-paper-50 hover:bg-vermilion-700 font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>加一格</span>
          </button>
        </div>
      </div>

      {/* Page Regeneration Prompt Popover */}
      {showRegenPrompt && (
        <div className="mb-4 p-3 bg-paper-100 border-2 border-ink-950 text-xs shadow-manga space-y-2">
          <div className="flex items-center justify-between font-bold text-ink-950">
            <span className="flex items-center gap-1 text-vermilion-700">
              <Sparkles className="w-3.5 h-3.5" />
              重新生成第 {page.pageNumber} 页分镜
            </span>
            <button
              onClick={() => setShowRegenPrompt(false)}
              className="text-ink-400 hover:text-ink-950"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-ink-600">
            AI 导演将仅对本页画格进行重新编排与镜头推导，保留其他页面内容不变：
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={pageRegenInstruction}
              onChange={(e) => setPageRegenInstruction(e.target.value)}
              placeholder="可选导演要求（如：加快节奏突出打斗、以特写开场等，留空使用默认模式）..."
              className="flex-1 px-2.5 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
            />
            <button
              onClick={handleDoRegeneratePage}
              className="px-4 py-1.5 bg-ink-950 text-paper-50 font-bold hover:bg-vermilion-700 transition-colors shadow-sm flex-shrink-0"
            >
              确认重构
            </button>
          </div>
        </div>
      )}

      {/* Reading Order Indicator Banner */}
      {showFlowArrows && (
        <div className="mb-3 px-3 py-1 bg-paper-100 border border-ink-300 text-[11px] flex items-center justify-between font-mono text-ink-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-vermilion-700">
              {isRtl ? "【日式读序】：从右上格 ◄ 向左下格 浏览" : "【条漫读序】：从上至下 ▼ 逐格流动"}
            </span>
          </div>
          <span className="text-ink-500 text-[10px]">
            视觉重心：{page.visualFocalPoint || "对角线视觉重心"}
          </span>
        </div>
      )}

      {/* Comic Panels Grid Canvas */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={getLayoutClasses(page.layoutTemplate, page.panels.length)}
      >
        {page.panels.map((panel, idx) => {
          const isSelected = panel.panelId === selectedPanelId;
          const shotInfo = SHOT_SIZE_LABELS[panel.shotSize];
          const angleInfo = CAMERA_ANGLE_LABELS[panel.cameraAngle];
          const isLastPanel = idx === page.panels.length - 1;

          // Compute directional flow guide for RTL manga vs webtoon
          let flowType: "left" | "down" | "last" = "left";
          if (isWebtoon) {
            flowType = "down";
          } else if (isLastPanel) {
            flowType = "last";
          } else {
            // In 2-col RTL: even index (0, 2) is on the right, pointing left to next
            // odd index (1, 3) is on the left, pointing down/wrap to next row
            if (idx % 2 === 0) {
              flowType = "left";
            } else {
              flowType = "down";
            }
          }

          return (
            <div
              key={panel.panelId}
              dir="ltr"
              onClick={() => setSelectedPanelId(panel.panelId)}
              className={`group relative flex flex-col border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-vermilion-600 ring-2 ring-vermilion-600/30 shadow-manga"
                  : "border-ink-950 hover:border-ink-700 hover:shadow-sm"
              } ${getPanelGridClasses(page.layoutTemplate, idx, page.panels.length)}`}
            >
              {/* Panel Top Header Bar */}
              <div
                className={`px-2 py-1 flex items-center justify-between text-[11px] border-b transition-colors ${
                  isSelected
                    ? "bg-vermilion-600 text-white border-vermilion-600"
                    : "bg-paper-100 text-ink-900 border-ink-950"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <span className="bg-ink-950 text-paper-50 px-1.5 py-0.2 text-[10px]">
                    #{panel.panelNumber}
                  </span>
                  <span>{shotInfo?.label || panel.shotSize}</span>
                  <span className="font-normal opacity-80">·</span>
                  <span className="font-normal">{angleInfo?.label || panel.cameraAngle}</span>
                </div>

                {/* Quick actions on panel header */}
                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePanel(page.pageId, panel.panelId, "up");
                    }}
                    disabled={idx === 0}
                    className="p-0.5 hover:bg-black/20 disabled:opacity-30 rounded"
                    title="上移此格"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePanel(page.pageId, panel.panelId, "down");
                    }}
                    disabled={idx === page.panels.length - 1}
                    className="p-0.5 hover:bg-black/20 disabled:opacity-30 rounded"
                    title="下移此格"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addPanel(page.pageId, panel.panelId);
                    }}
                    className="p-0.5 hover:bg-black/20 rounded ml-1"
                    title="在本格后插入新画格"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  {page.panels.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除第 ${panel.panelNumber} 格吗？`)) {
                          deletePanel(page.pageId, panel.panelId);
                        }
                      }}
                      className="p-0.5 hover:bg-black/20 hover:text-white rounded ml-0.5"
                      title="删除本格"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Panel SVG Wireframe Content */}
              <div className="flex-1 relative overflow-hidden">
                <PanelWireframe panel={panel} isSelected={isSelected} />

                {/* Eye trace visual flow arrow indicator */}
                {showFlowArrows && (
                  <>
                    {!isLastPanel && flowType === "left" && (
                      <div
                        className="absolute bottom-1 left-1 bg-ink-950/85 text-white rounded px-1.5 py-0.5 flex items-center gap-1 text-[9px] font-mono pointer-events-none shadow-sm z-20"
                        title="视线向左移动至下一格"
                      >
                        <ArrowLeft className="w-3 h-3 text-vermilion-400" />
                        <span>流向</span>
                      </div>
                    )}

                    {!isLastPanel && flowType === "down" && (
                      <div
                        className="absolute bottom-1 right-1 bg-ink-950/85 text-white rounded px-1.5 py-0.5 flex items-center gap-1 text-[9px] font-mono pointer-events-none shadow-sm z-20"
                        title="视线向下换行至下一格"
                      >
                        <CornerDownRight className="w-3 h-3 text-amber-400" />
                        <span>换行</span>
                      </div>
                    )}

                    {isLastPanel && (
                      <div
                        className="absolute bottom-1 left-1 bg-vermilion-700 text-white rounded px-1.5 py-0.5 flex items-center gap-1 text-[9px] font-bold font-mono pointer-events-none shadow-sm z-20"
                        title="本页最终格：翻页悬念钩子"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>翻页悬念</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Page Footer (Cliffhanger & Gutter note) */}
      <div className="mt-4 pt-3 border-t-2 border-ink-950 flex items-center justify-between text-xs text-ink-600 font-mono">
        <div className="flex items-center gap-1.5 text-vermilion-700 font-bold">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate max-w-lg">
            翻页钩子 (Page-turn Hook)：{page.pageTurnSuspense || "未设置，建议在底格留下戏剧性疑问"}
          </span>
        </div>
        <div className="text-ink-400 text-[11px]">
          - {page.pageNumber} -
        </div>
      </div>
    </div>
  );
}
