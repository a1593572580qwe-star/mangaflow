"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import {
  Layers,
  Sparkles,
  Undo2,
  Redo2,
  Download,
  Settings,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  Plus,
  Compass,
  ArrowRightLeft,
  RotateCw,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { StoryAnalysisModal } from "@/components/modals/StoryAnalysisModal";
import { ExportModal } from "@/components/modals/ExportModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { ContinuityModal } from "@/components/modals/ContinuityModal";
import { NewProjectModal } from "@/components/modals/NewProjectModal";

export function Header() {
  const {
    projects,
    activeProject,
    setActiveProjectId,
    deleteProject,
    saveStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    zoomLevel,
    setZoomLevel,
    showFlowArrows,
    setShowFlowArrows,
    setStoryboardPages,
    apiConfig,
    resetToDemo,
  } = useStoryboard();

  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContinuityOpen, setIsContinuityOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const handleGenerateStoryboard = async () => {
    if (!activeProject.synopsis) {
      alert("请先在左侧企划中填写故事大纲或剧情文本。");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: activeProject,
          apiConfig: apiConfig.isCustomConfigured ? apiConfig : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "分镜生成失败");
      }

      setStoryboardPages(data.pages);
      if (data.isDemoMode) {
        // Subtle alert or status indication
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "分镜生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <header className="h-14 border-b-2 border-ink-950 bg-paper-50 flex items-center justify-between px-4 select-none z-30 sticky top-0">
        {/* Left: Brand & Project Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-ink-300">
            {/* Japanese manga seal badge */}
            <div className="w-8 h-8 bg-vermilion-600 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm font-manga border border-ink-950">
              分鏡
            </div>
            <div>
              <div className="font-black text-ink-950 text-sm tracking-wider leading-none flex items-center gap-1.5 font-manga">
                MangaFlow
                <span className="text-[10px] font-normal px-1 py-0.2 bg-ink-200 text-ink-800 border border-ink-400">
                  工坊
                </span>
              </div>
              <div className="text-[10px] text-ink-500 font-mono">AI 漫画分镜辅助创作台</div>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 bg-white border border-ink-950 hover:bg-paper-100 text-xs font-bold text-ink-900 transition-colors shadow-sm max-w-[220px]"
            >
              <FolderOpen className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
              <span className="truncate">{activeProject.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-400 flex-shrink-0 ml-auto" />
            </button>

            {projectDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border-2 border-ink-950 shadow-manga z-50 py-1 text-xs">
                <div className="px-3 py-1 font-bold text-ink-400 text-[10px] uppercase border-b border-ink-200">
                  当前工作区企划
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-paper-100 transition-colors cursor-pointer group ${
                        proj.id === activeProject.id ? "bg-paper-200 font-bold text-vermilion-700" : "text-ink-800"
                      }`}
                    >
                      <span className="truncate flex-1 pr-2">{proj.title}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono text-ink-400">
                          {proj.pages?.length || 0}P
                        </span>
                        {projects.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`确定删除企划《${proj.title}》吗？`)) {
                                deleteProject(proj.id);
                              }
                            }}
                            className="p-0.5 text-ink-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"
                            title="删除此企划"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-ink-200 p-1 bg-paper-50 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      setIsNewProjectOpen(true);
                    }}
                    className="flex items-center gap-1 w-full px-2 py-1 text-xs font-bold text-ink-950 hover:bg-white hover:text-vermilion-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新建企划...
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Project Quick Button */}
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="p-1.5 text-ink-700 hover:text-ink-950 hover:bg-ink-100 border border-transparent hover:border-ink-300 transition-colors"
            title="新建漫画企划"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Undo/Redo & Save Status & Zoom */}
        <div className="hidden md:flex items-center gap-4">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border border-ink-300 bg-white p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="撤销 (Ctrl+Z)"
              className="p-1 hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent text-ink-800 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="重做 (Ctrl+Y)"
              className="p-1 hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent text-ink-800 transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reading Flow Guide Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2 py-0.5 text-[11px] font-bold border ${
                activeProject.format === "webtoon"
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-paper-100 text-ink-900 border-ink-400"
              }`}
            >
              {activeProject.format === "webtoon" ? "纵向条漫 (从上至下 ▼)" : "日式分页 (右向左 ◄)"}
            </span>

            <button
              onClick={() => setShowFlowArrows(!showFlowArrows)}
              className={`px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                showFlowArrows
                  ? "bg-ink-950 text-paper-50 border-ink-950"
                  : "bg-white text-ink-600 border-ink-300 hover:bg-ink-50"
              }`}
              title="切换画格视线阅读动势指示箭头的显示"
            >
              阅读视线 {showFlowArrows ? "显示" : "隐藏"}
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-ink-300 bg-white px-1.5 py-0.5 text-xs text-ink-700">
            <button
              onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
              className="p-0.5 hover:text-ink-950"
              title="缩小"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono text-[11px] w-8 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
              className="p-0.5 hover:text-ink-950"
              title="放大"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            {zoomLevel !== 100 && (
              <button
                onClick={() => setZoomLevel(100)}
                className="p-0.5 hover:text-ink-950 ml-1 border-l border-ink-200 pl-1"
                title="重置100%"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Save Status Badge */}
          <div className="text-[11px] font-mono text-ink-500 flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === "saved"
                  ? "bg-emerald-500"
                  : saveStatus === "saving"
                  ? "bg-amber-500 animate-ping"
                  : "bg-rose-500"
              }`}
            />
            <span>{saveStatus === "saved" ? "本地已保存" : saveStatus === "saving" ? "自动保存中..." : "未保存"}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Pre-analysis */}
          <button
            onClick={() => setIsAnalysisOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-950 hover:bg-ink-50 text-xs font-bold text-ink-900 transition-colors shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-ink-700" />
            <span>剧作分析</span>
          </button>

          {/* AI Generate / Regenerate */}
          <button
            onClick={handleGenerateStoryboard}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-vermilion-600 hover:bg-vermilion-700 text-white text-xs font-bold transition-colors shadow-manga disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "分镜生成中..." : "生成分页分镜"}</span>
          </button>

          {/* Continuity review */}
          <button
            onClick={() => setIsContinuityOpen(true)}
            className="p-1.5 text-ink-700 hover:text-ink-950 hover:bg-ink-100 border border-ink-300 hover:border-ink-950 bg-white transition-colors"
            title="分镜连贯性审查 (180度轴线/景别审查)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </button>

          {/* Export */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="p-1.5 text-ink-700 hover:text-ink-950 hover:bg-ink-100 border border-ink-300 hover:border-ink-950 bg-white transition-colors"
            title="导出 Markdown 脚本 / JSON / 打印稿"
          >
            <Download className="w-4 h-4 text-ink-800" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-ink-700 hover:text-ink-950 hover:bg-ink-100 border border-ink-300 hover:border-ink-950 bg-white transition-colors"
            title="AI 接口与演示模式设置"
          >
            <Settings className="w-4 h-4 text-ink-800" />
          </button>
        </div>
      </header>

      {/* Modals */}
      <StoryAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        onProceedToStoryboard={handleGenerateStoryboard}
      />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ContinuityModal isOpen={isContinuityOpen} onClose={() => setIsContinuityOpen(false)} />
      <NewProjectModal isOpen={isNewProjectOpen} onClose={() => setIsNewProjectOpen(false)} />
    </>
  );
}
