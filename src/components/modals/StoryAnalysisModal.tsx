"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { StoryAnalysis } from "@/types/storyboard";
import {
  X,
  Compass,
  Sparkles,
  Eye,
  MessageSquare,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

interface StoryAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToStoryboard: () => void;
}

export function StoryAnalysisModal({ isOpen, onClose, onProceedToStoryboard }: StoryAnalysisModalProps) {
  const { activeProject, setStoryAnalysis, apiConfig } = useStoryboard();
  const [analysis, setLocalAnalysis] = useState<StoryAnalysis | null>(activeProject.analysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "characters" | "beats" | "advice">("events");

  // Sync with project analysis on open
  React.useEffect(() => {
    if (isOpen) {
      setLocalAnalysis(activeProject.analysis);
      setDemoNotice(null);
    }
  }, [isOpen, activeProject.analysis]);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setDemoNotice(null);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: activeProject,
          apiConfig: apiConfig.isCustomConfigured ? apiConfig : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "剧情分析失败");
      }

      setLocalAnalysis(data.analysis);
      setStoryAnalysis(data.analysis);

      if (data.isDemoMode) {
        setDemoNotice("当前处于演示模式：已根据您的剧情文本生成结构化剧情拆解（免配置 API Key）。");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "分析发生错误");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndProceed = () => {
    if (analysis) {
      setStoryAnalysis(analysis);
    }
    onClose();
    onProceedToStoryboard();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-paper-50 border-2 border-ink-950 shadow-manga-lg w-full max-w-4xl rounded-none flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-950 bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-ink-950 text-paper-50 px-2 py-0.5 font-bold text-xs">分析</span>
            <h2 className="text-lg font-bold text-ink-950 font-manga tracking-wide">
              漫画前期剧作与视觉叙事分析
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ink-100 border border-transparent hover:border-ink-950 transition-colors"
          >
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        {/* Demo banner if active */}
        {demoNotice && (
          <div className="bg-amber-50 border-b border-amber-300 px-6 py-2 text-xs text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{demoNotice}</span>
          </div>
        )}

        {/* Long text analysis badge */}
        {activeProject.synopsis && activeProject.synopsis.length > 250 && (
          <div className="bg-sky-50 border-b border-sky-300 px-6 py-1.5 text-xs text-sky-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="font-bold">✦ 长文本分析机制：</span>
              已启用分段因果链提取（字数 {activeProject.synopsis.length}），确保后半段剧情不被压缩遗漏。
            </span>
            <span className="font-mono text-[10px] text-sky-700">Show, Don&apos;t Tell</span>
          </div>
        )}

        {/* Action bar */}
        <div className="px-6 py-3 bg-paper-100 border-b border-ink-950/20 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("events")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "events"
                  ? "bg-ink-950 text-paper-50"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              1. 因果事件链与场景
            </button>
            <button
              onClick={() => setActiveTab("characters")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "characters"
                  ? "bg-ink-950 text-paper-50"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              2. 人物弧光与心境
            </button>
            <button
              onClick={() => setActiveTab("beats")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "beats"
                  ? "bg-ink-950 text-paper-50"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              3. 视觉vs文字 & 翻页钩子
            </button>
            <button
              onClick={() => setActiveTab("advice")}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "advice"
                  ? "bg-ink-950 text-paper-50"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              4. 分镜导演总评
            </button>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-950 hover:bg-ink-50 font-bold text-xs text-ink-950 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "AI 剧作分析中..." : analysis ? "重新分析剧本" : "开始提取剧作分析"}
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-paper-50">
          {!analysis && !isAnalyzing && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-2 border-ink-950 bg-white flex items-center justify-center mx-auto text-ink-800 shadow-manga">
                <Compass className="w-6 h-6 text-vermilion-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-ink-950 text-base">尚未进行剧作分镜分析</h3>
                <p className="text-xs text-ink-600 max-w-md mx-auto leading-relaxed">
                  在正式生成分页漫画格前，AI
                  导演将先行提炼事件因果、确定哪些信息通过画面展现（Show, Don&apos;t Tell）、哪些依靠台词、何处安排翻页悬念。
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                className="px-5 py-2 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-manga"
              >
                立即开始故事分析
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-16 text-center space-y-3">
              <RotateCw className="w-8 h-8 animate-spin text-ink-950 mx-auto" />
              <p className="font-bold text-ink-950">分镜导演正在审阅剧本并构建因果节拍...</p>
              <p className="text-xs text-ink-500">正在提炼视觉线索、翻页钩子与角色行动</p>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <>
              {activeTab === "events" && (
                <div className="space-y-5">
                  <div className="bg-white p-4 border border-ink-950 shadow-sm space-y-3">
                    <h4 className="font-bold text-ink-950 text-xs tracking-wider uppercase border-b border-ink-200 pb-2">
                      因果事件链 (Event Sequence)
                    </h4>
                    <p className="text-xs text-ink-600">
                      不是机械地把每一句话变成一格，而是理清因果，决定哪些省略、合并或突出：
                    </p>
                    <div className="space-y-2">
                      {analysis.events.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 bg-ink-950 text-paper-50 flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={ev}
                            onChange={(e) => {
                              const updated = [...analysis.events];
                              updated[idx] = e.target.value;
                              setLocalAnalysis({ ...analysis, events: updated });
                            }}
                            className="flex-1 bg-paper-50 border border-ink-300 px-2 py-1 text-ink-900 text-xs focus:bg-white focus:outline-none focus:border-ink-950"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-ink-950 shadow-sm space-y-3">
                    <h4 className="font-bold text-ink-950 text-xs tracking-wider uppercase border-b border-ink-200 pb-2">
                      场景切分与叙事目的 (Scenes)
                    </h4>
                    <div className="space-y-3">
                      {analysis.sceneBreaks.map((scene, idx) => (
                        <div key={scene.sceneId || idx} className="p-3 bg-paper-50 border border-ink-300 space-y-2">
                          <div className="flex items-center justify-between font-bold text-xs text-ink-950">
                            <span>{scene.heading}</span>
                            <span className="font-mono text-ink-500 text-[11px]">{scene.timeAndSetting}</span>
                          </div>
                          <div className="text-xs text-ink-700">
                            <span className="font-bold text-ink-900">叙事目的：</span>
                            {scene.purpose}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "characters" && (
                <div className="space-y-4">
                  <div className="bg-white p-4 border border-ink-950 shadow-sm space-y-3">
                    <h4 className="font-bold text-ink-950 text-xs tracking-wider uppercase border-b border-ink-200 pb-2">
                      角色情绪弧光与关键动作 (Character Arcs)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.characterArcs.map((arc, idx) => (
                        <div key={idx} className="p-3 bg-paper-50 border border-ink-300 space-y-2">
                          <div className="font-bold text-sm text-ink-950 flex items-center justify-between">
                            <span>{arc.characterName}</span>
                            <span className="text-[10px] bg-ink-200 text-ink-800 px-1.5 py-0.5">心境轨迹</span>
                          </div>
                          <div className="text-xs text-ink-700">
                            <div className="font-semibold text-ink-900">情绪变迁：</div>
                            <div className="mt-0.5">{arc.emotionShift}</div>
                          </div>
                          <div className="text-xs text-ink-700">
                            <div className="font-semibold text-ink-900">关键承载动作：</div>
                            <div className="mt-0.5 text-vermilion-700 font-medium">{arc.keyAction}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "beats" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual pointers */}
                    <div className="bg-white p-4 border border-ink-950 shadow-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink-950 border-b border-ink-200 pb-1.5">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        适合纯画面展现的信息 (Show, Don&apos;t Tell)
                      </div>
                      <ul className="list-disc list-inside text-xs space-y-1.5 text-ink-700">
                        {analysis.visualPointers.map((p, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Text pointers */}
                    <div className="bg-white p-4 border border-ink-950 shadow-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink-950 border-b border-ink-200 pb-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        必须依赖文字/旁白交代的细节
                      </div>
                      <ul className="list-disc list-inside text-xs space-y-1.5 text-ink-700">
                        {analysis.textPointers.map((p, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cliffhanger moments */}
                  <div className="bg-white p-4 border border-ink-950 shadow-sm space-y-3">
                    <h4 className="font-bold text-ink-950 text-xs tracking-wider uppercase border-b border-ink-200 pb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-vermilion-600" />
                      适合停顿、特写或翻页揭示的震撼时刻 (Page-turn Hooks)
                    </h4>
                    <div className="space-y-2">
                      {analysis.pauseAndRevealMoments.map((m, idx) => (
                        <div key={idx} className="p-2.5 bg-paper-100 border border-ink-300 text-xs text-ink-900 leading-relaxed font-medium">
                          ✦ {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "advice" && (
                <div className="bg-white p-5 border border-ink-950 shadow-sm space-y-4">
                  <h4 className="font-bold text-ink-950 text-xs tracking-wider uppercase border-b border-ink-200 pb-2">
                    分镜监督全局节奏指导
                  </h4>
                  <div className="text-xs text-ink-800 leading-relaxed whitespace-pre-wrap bg-paper-50 p-4 border border-ink-200 font-sans">
                    {analysis.narrativeAdvice}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-ink-950 bg-paper-100 flex items-center justify-between">
          <div className="text-xs text-ink-600">
            {analysis ? "已完成故事前期梳理，可直接进入下一阶段分页分镜生成。" : "请先点击分析以提取剧情骨干。"}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-ink-300 hover:bg-ink-100 text-ink-700 text-xs font-medium transition-colors"
            >
              稍后查看
            </button>
            <button
              onClick={handleSaveAndProceed}
              disabled={!analysis || isAnalyzing}
              className="flex items-center gap-1.5 px-5 py-1.5 bg-vermilion-600 text-white font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-manga disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              确认分析，生成分页分镜
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
