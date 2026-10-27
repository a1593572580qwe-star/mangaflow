"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import {
  ShotSize,
  CameraAngle,
  CompositionType,
  TextElementType,
  StoryboardPanel,
} from "@/types/storyboard";
import {
  SHOT_SIZE_LABELS,
  CAMERA_ANGLE_LABELS,
  COMPOSITION_LABELS,
  TEXT_TYPE_LABELS,
} from "@/lib/utils/mangaLabels";
import {
  Sliders,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Check,
  RotateCw,
  HelpCircle,
  Eye,
  Film,
  Compass,
  ArrowRight,
} from "lucide-react";

export function PanelInspector() {
  const {
    activeProject,
    activePage,
    selectedPanel,
    updatePanel,
    applyAlternativeShot,
    addTextElement,
    updateTextElement,
    deleteTextElement,
    apiConfig,
  } = useStoryboard();

  const [activeTab, setActiveTab] = useState<"visual" | "dialogue" | "teaching">("visual");
  const [regenInstruction, setRegenInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showAltModal, setShowAltModal] = useState(false);

  if (!selectedPanel) {
    return (
      <aside className="w-96 border-l-2 border-ink-950 bg-paper-100 flex flex-col items-center justify-center p-6 text-center select-none text-ink-600">
        <div className="w-10 h-10 border border-ink-400 bg-white flex items-center justify-center mb-3">
          <Sliders className="w-5 h-5 text-ink-400" />
        </div>
        <div className="font-bold text-ink-950 text-xs mb-1">未选中漫画格</div>
        <p className="text-[11px] text-ink-500 leading-relaxed">
          点击画布上的任意漫画格，在此查看和编辑画面镜头、文字气泡与分镜导演教学指导。
        </p>
      </aside>
    );
  }

  const handleRegeneratePanel = async () => {
    if (!regenInstruction.trim()) {
      alert("请输入对当前漫画格的具体调整要求。");
      return;
    }

    setIsRegenerating(true);
    try {
      const prevIdx = (selectedPanel.panelNumber || 1) - 2;
      const nextIdx = (selectedPanel.panelNumber || 1);
      const prevPanel = activePage?.panels[prevIdx];
      const nextPanel = activePage?.panels[nextIdx];

      const res = await fetch("/api/ai/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panel: selectedPanel,
          instruction: regenInstruction.trim(),
          context: {
            projectTitle: activeProject.title,
            sceneName: activePage?.sceneName,
            prevPanelSummary: prevPanel ? `${prevPanel.shotSize} · ${prevPanel.action}` : undefined,
            nextPanelSummary: nextPanel ? `${nextPanel.shotSize} · ${nextPanel.action}` : undefined,
          },
          apiConfig: apiConfig.isCustomConfigured ? apiConfig : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "单格微调失败");
      }

      updatePanel(selectedPanel.panelId, data.panel);
      setRegenInstruction("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "调整失败");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <aside className="w-96 border-l-2 border-ink-950 bg-paper-100 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Inspector Header */}
      <div className="p-3 border-b-2 border-ink-950 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-ink-950 text-paper-50 flex items-center justify-center font-bold text-xs font-mono">
              #{selectedPanel.panelNumber}
            </span>
            <div>
              <div className="font-bold text-ink-950 text-xs">
                {SHOT_SIZE_LABELS[selectedPanel.shotSize]?.label || selectedPanel.shotSize}
              </div>
              <div className="text-[10px] text-ink-500 font-mono">
                {CAMERA_ANGLE_LABELS[selectedPanel.cameraAngle]?.label || selectedPanel.cameraAngle}
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-paper-200 border border-ink-400 text-ink-800">
            {selectedPanel.composition.type}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-ink-950 bg-white text-xs font-bold text-ink-700">
        <button
          onClick={() => setActiveTab("visual")}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "visual"
              ? "bg-paper-100 text-ink-950 border-b-2 border-vermilion-600 -mb-0.5"
              : "hover:bg-paper-50"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>画面与镜头</span>
        </button>

        <button
          onClick={() => setActiveTab("dialogue")}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "dialogue"
              ? "bg-paper-100 text-ink-950 border-b-2 border-vermilion-600 -mb-0.5"
              : "hover:bg-paper-50"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>台词 ({selectedPanel.textElements?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("teaching")}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "teaching"
              ? "bg-paper-100 text-vermilion-700 border-b-2 border-vermilion-600 -mb-0.5 font-bold"
              : "hover:bg-paper-50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>分镜教学</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* TAB 1: VISUAL & CAMERA */}
        {activeTab === "visual" && (
          <div className="space-y-4">
            {/* Quick selectors for Shot Size & Camera Angle */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-ink-950 mb-1">景别 (Shot Size)</label>
                <select
                  value={selectedPanel.shotSize}
                  onChange={(e) => updatePanel(selectedPanel.panelId, { shotSize: e.target.value as ShotSize })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="extreme_wide">大远景 (EWS)</option>
                  <option value="wide">远景/全景 (WS)</option>
                  <option value="medium">中景 (MS)</option>
                  <option value="close_up">近景 (CU)</option>
                  <option value="extreme_close_up">面部特写 (ECU)</option>
                  <option value="detail">局部特写 (Detail)</option>
                </select>
                <p className="text-[10px] text-ink-500 mt-1 leading-tight">
                  {SHOT_SIZE_LABELS[selectedPanel.shotSize]?.desc}
                </p>
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">机位视角 (Angle)</label>
                <select
                  value={selectedPanel.cameraAngle}
                  onChange={(e) => updatePanel(selectedPanel.panelId, { cameraAngle: e.target.value as CameraAngle })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="eye_level">平视 (Eye Level)</option>
                  <option value="low_angle">仰角 (Low Angle)</option>
                  <option value="high_angle">俯角 (High Angle)</option>
                  <option value="dutch_angle">倾斜构图 (Dutch)</option>
                  <option value="over_the_shoulder">过肩镜头 (OTS)</option>
                  <option value="birds_eye">鸟瞰 (Bird&apos;s Eye)</option>
                </select>
                <p className="text-[10px] text-ink-500 mt-1 leading-tight">
                  {CAMERA_ANGLE_LABELS[selectedPanel.cameraAngle]?.desc}
                </p>
              </div>
            </div>

            {/* Narration Purpose */}
            <div>
              <label className="block font-bold text-ink-950 mb-1">本格叙事目的</label>
              <textarea
                rows={2}
                value={selectedPanel.narrationPurpose}
                onChange={(e) => updatePanel(selectedPanel.panelId, { narrationPurpose: e.target.value })}
                className="w-full p-2 bg-white border border-ink-950 text-xs leading-relaxed focus:outline-none"
              />
            </div>

            {/* Visual Description for Manga Artist */}
            <div>
              <label className="block font-bold text-ink-950 mb-1">
                完整画面描述 (供漫画绘制者使用)
              </label>
              <textarea
                rows={4}
                value={selectedPanel.visualDescription}
                onChange={(e) => updatePanel(selectedPanel.panelId, { visualDescription: e.target.value })}
                className="w-full p-2 bg-white border border-ink-950 text-xs leading-relaxed focus:outline-none"
              />
            </div>

            {/* Action and Expression */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-ink-950 mb-1">人物动作瞬间</label>
                <textarea
                  rows={2}
                  value={selectedPanel.action}
                  onChange={(e) => updatePanel(selectedPanel.panelId, { action: e.target.value })}
                  className="w-full p-2 bg-white border border-ink-300 focus:border-ink-950 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">表情神态</label>
                <textarea
                  rows={2}
                  value={selectedPanel.expression}
                  onChange={(e) => updatePanel(selectedPanel.panelId, { expression: e.target.value })}
                  className="w-full p-2 bg-white border border-ink-300 focus:border-ink-950 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Background & Lighting */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-ink-950 mb-1">背景与环境细节</label>
                <input
                  type="text"
                  value={selectedPanel.background}
                  onChange={(e) => updatePanel(selectedPanel.panelId, { background: e.target.value })}
                  className="w-full p-1.5 bg-white border border-ink-300 focus:border-ink-950 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">光线与情绪氛围</label>
                <input
                  type="text"
                  value={selectedPanel.lightingAndMood}
                  onChange={(e) => updatePanel(selectedPanel.panelId, { lightingAndMood: e.target.value })}
                  className="w-full p-1.5 bg-white border border-ink-300 focus:border-ink-950 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Character Placements Editor */}
            <div className="bg-white p-3 border border-ink-950 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-ink-950 border-b border-ink-200 pb-1">
                <span>画面人物站位与朝向</span>
                <span className="text-[10px] text-ink-500 font-mono">
                  {selectedPanel.characterPositions?.length || 0} 人
                </span>
              </div>

              {selectedPanel.characterPositions?.map((char, cIdx) => (
                <div key={cIdx} className="p-2 bg-paper-50 border border-ink-200 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-ink-900">
                    <span>{char.name}</span>
                    <span className="text-[10px] text-ink-500">{char.depth}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <span className="text-[10px] text-ink-500">位置:</span>
                      <select
                        value={char.position}
                        onChange={(e) => {
                          const updated = [...selectedPanel.characterPositions];
                          updated[cIdx] = { ...char, position: e.target.value as any };
                          updatePanel(selectedPanel.panelId, { characterPositions: updated });
                        }}
                        className="w-full bg-white border border-ink-300 text-[10px]"
                      >
                        <option value="left">靠左</option>
                        <option value="center">居中</option>
                        <option value="right">靠右</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-ink-500">深度:</span>
                      <select
                        value={char.depth}
                        onChange={(e) => {
                          const updated = [...selectedPanel.characterPositions];
                          updated[cIdx] = { ...char, depth: e.target.value as any };
                          updatePanel(selectedPanel.panelId, { characterPositions: updated });
                        }}
                        className="w-full bg-white border border-ink-300 text-[10px]"
                      >
                        <option value="foreground">前景</option>
                        <option value="midground">中景</option>
                        <option value="background">远景</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-ink-500">朝向:</span>
                      <select
                        value={char.facing}
                        onChange={(e) => {
                          const updated = [...selectedPanel.characterPositions];
                          updated[cIdx] = { ...char, facing: e.target.value as any };
                          updatePanel(selectedPanel.panelId, { characterPositions: updated });
                        }}
                        className="w-full bg-white border border-ink-300 text-[10px]"
                      >
                        <option value="front">正面</option>
                        <option value="left">朝左</option>
                        <option value="right">朝右</option>
                        <option value="back">背身</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawing Notes */}
            <div>
              <label className="block font-bold text-ink-950 mb-1">画面绘制注意事项</label>
              <textarea
                rows={2}
                value={selectedPanel.drawingNotes}
                onChange={(e) => updatePanel(selectedPanel.panelId, { drawingNotes: e.target.value })}
                className="w-full p-2 bg-white border border-ink-300 focus:border-ink-950 text-xs focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DIALOGUE & SPEECH BUBBLES */}
        {activeTab === "dialogue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-950 text-xs">台词、旁白与音效列表</span>
              <button
                onClick={() => addTextElement(selectedPanel.panelId)}
                className="flex items-center gap-1 px-2 py-0.5 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-sm"
              >
                <Plus className="w-3 h-3" />
                新增台词/音效
              </button>
            </div>

            {selectedPanel.textElements.length === 0 ? (
              <div className="p-6 bg-white border border-ink-300 text-center space-y-2">
                <p className="text-xs text-ink-600">当前漫画格为【无声格 / 纯画面展现】</p>
                <p className="text-[10px] text-ink-400">
                  日漫分镜提倡适度留白，并非每一格都需要文字。如需对白，请点击右上角新增。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPanel.textElements.map((txt) => {
                  const typeMeta = TEXT_TYPE_LABELS[txt.type] || TEXT_TYPE_LABELS.dialogue;

                  return (
                    <div key={txt.id} className="p-3 bg-white border border-ink-950 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.2 border font-bold ${typeMeta.badgeClass}`}>
                            {typeMeta.label}
                          </span>
                          <span className="text-[10px] font-mono text-ink-400">
                            顺位 #{txt.readingPriority}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteTextElement(selectedPanel.panelId, txt.id)}
                          className="p-1 text-ink-400 hover:text-rose-600 transition-colors"
                          title="删除该台词"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Content editor */}
                      <div>
                        <textarea
                          rows={2}
                          value={txt.content}
                          onChange={(e) =>
                            updateTextElement(selectedPanel.panelId, txt.id, { content: e.target.value })
                          }
                          className="w-full p-1.5 bg-paper-50 border border-ink-300 focus:bg-white focus:border-ink-950 text-xs leading-relaxed focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[10px] text-ink-500 font-semibold mb-0.5">发声人物</label>
                          <input
                            type="text"
                            value={txt.speaker}
                            onChange={(e) =>
                              updateTextElement(selectedPanel.panelId, txt.id, { speaker: e.target.value })
                            }
                            className="w-full p-1 bg-paper-50 border border-ink-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-ink-500 font-semibold mb-0.5">文字类型</label>
                          <select
                            value={txt.type}
                            onChange={(e) =>
                              updateTextElement(selectedPanel.panelId, txt.id, {
                                type: e.target.value as TextElementType,
                              })
                            }
                            className="w-full p-1 bg-white border border-ink-300 text-xs"
                          >
                            <option value="dialogue">普通对白</option>
                            <option value="offPanelDialogue">画外对白</option>
                            <option value="narration">旁白/解说</option>
                            <option value="innerMonologue">内心独白</option>
                            <option value="thought">思考泡</option>
                            <option value="sfx">拟声词 (SFX)</option>
                            <option value="whisper">低语/气声</option>
                            <option value="shout">呐喊/爆烈</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[10px] text-ink-500 font-semibold mb-0.5">建议气泡摆放</label>
                          <select
                            value={txt.suggestedPosition}
                            onChange={(e) =>
                              updateTextElement(selectedPanel.panelId, txt.id, {
                                suggestedPosition: e.target.value as any,
                              })
                            }
                            className="w-full p-1 bg-white border border-ink-300 text-xs"
                          >
                            <option value="top_right">右上角 (日式首选)</option>
                            <option value="top_left">左上角</option>
                            <option value="center">正中</option>
                            <option value="bottom_right">右下角</option>
                            <option value="bottom_left">左下角</option>
                            <option value="floating">悬浮</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-ink-500 font-semibold mb-0.5">气泡样式</label>
                          <input
                            type="text"
                            value={txt.suggestedStyle}
                            onChange={(e) =>
                              updateTextElement(selectedPanel.panelId, txt.id, { suggestedStyle: e.target.value })
                            }
                            className="w-full p-1 bg-paper-50 border border-ink-200 text-xs"
                          />
                        </div>
                      </div>

                      <div className="text-[10px] text-ink-500 italic">
                        设计理由：{txt.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STORYBOARD TEACHING & ALTERNATIVES */}
        {activeTab === "teaching" && (
          <div className="space-y-4">
            {/* Director Teaching Card */}
            <div className="bg-white p-4 border-2 border-ink-950 shadow-manga space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-xs text-vermilion-700 border-b border-ink-200 pb-2">
                <GraduationCap className="w-4 h-4" />
                <span>分镜监督：为什么这样画？</span>
              </div>

              <div className="space-y-2 text-xs text-ink-800 leading-relaxed">
                <div>
                  <span className="font-bold text-ink-950 block mb-0.5">1. 景别与视角选择意图：</span>
                  <p className="bg-paper-50 p-2 border border-ink-200">{selectedPanel.teachingNote.whyThisShot}</p>
                </div>

                <div>
                  <span className="font-bold text-ink-950 block mb-0.5">2. 希望读者首先注意什么：</span>
                  <p className="bg-paper-50 p-2 border border-ink-200">{selectedPanel.teachingNote.readerFocus}</p>
                </div>

                <div>
                  <span className="font-bold text-ink-950 block mb-0.5">3. 情绪与节奏推进：</span>
                  <p className="bg-paper-50 p-2 border border-ink-200">{selectedPanel.teachingNote.emotionAndPacing}</p>
                </div>

                <div>
                  <span className="font-bold text-ink-950 block mb-0.5">4. 与前后画格的衔接逻辑：</span>
                  <p className="bg-paper-50 p-2 border border-ink-200">{selectedPanel.teachingNote.panelTransitionLogic}</p>
                </div>

                <div>
                  <span className="font-bold text-ink-950 block mb-0.5">5. 画面与文字分工：</span>
                  <p className="bg-paper-50 p-2 border border-ink-200">{selectedPanel.teachingNote.textVisualBalance}</p>
                </div>
              </div>
            </div>

            {/* Alternative Shot Proposals */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between font-bold text-xs text-ink-950">
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-ink-700" />
                  导演备选构图方案 ({selectedPanel.teachingNote.alternativeShots?.length || 0})
                </span>
              </div>

              {selectedPanel.teachingNote.alternativeShots?.map((alt, aIdx) => (
                <div key={aIdx} className="bg-white p-3 border border-ink-950 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-950">{alt.title}</span>
                    <button
                      onClick={() => {
                        applyAlternativeShot(selectedPanel.panelId, aIdx);
                      }}
                      className="px-2 py-0.5 bg-ink-950 text-paper-50 hover:bg-vermilion-700 font-bold text-[11px] transition-colors shadow-sm"
                    >
                      采用此方案
                    </button>
                  </div>

                  <div className="text-[11px] text-ink-600 font-mono">
                    {alt.shotSize} · {alt.cameraAngle} · {alt.composition}
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="text-emerald-800">
                      <span className="font-bold">优势：</span>
                      {alt.pros}
                    </div>
                    <div className="text-rose-800">
                      <span className="font-bold">权衡：</span>
                      {alt.cons}
                    </div>
                    <div className="text-ink-700 bg-paper-50 p-1.5 border border-ink-200 leading-relaxed">
                      {alt.visualDescription}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single Panel AI Regenerate Box */}
            <div className="bg-paper-200 p-3.5 border-2 border-ink-950 space-y-2">
              <div className="font-bold text-xs text-ink-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-vermilion-600" />
                单格 AI 微调与重构
              </div>
              <p className="text-[11px] text-ink-600">
                输入您的导演指令，或点击下方快捷导演微调方案：
              </p>

              {/* Fast Director Presets */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5 pb-1">
                <button
                  type="button"
                  onClick={() => setRegenInstruction("加快剧情节奏：改为倾斜机位面部特写，强化情绪冲突")}
                  className="px-2 py-1 bg-white border border-ink-300 hover:border-ink-950 hover:bg-paper-50 text-left text-[10px] text-ink-800 transition-colors"
                >
                  ⚡ 加快戏剧节奏
                </button>
                <button
                  type="button"
                  onClick={() => setRegenInstruction("补充镜头变化：切换为大远景或过肩反打，丰富空间层次")}
                  className="px-2 py-1 bg-white border border-ink-300 hover:border-ink-950 hover:bg-paper-50 text-left text-[10px] text-ink-800 transition-colors"
                >
                  🎥 补充镜头景别
                </button>
                <button
                  type="button"
                  onClick={() => setRegenInstruction("请求全新备选构图方案：提供2种截然不同的视觉切入视角")}
                  className="px-2 py-1 bg-white border border-ink-300 hover:border-ink-950 hover:bg-paper-50 text-left text-[10px] text-ink-800 transition-colors"
                >
                  💡 索取新备选构图
                </button>
                <button
                  type="button"
                  onClick={() => setRegenInstruction("视觉留白：转为局部道具特写与纯画面无声格，删去冗余对白")}
                  className="px-2 py-1 bg-white border border-ink-300 hover:border-ink-950 hover:bg-paper-50 text-left text-[10px] text-ink-800 transition-colors"
                >
                  🤫 纯画面留白格
                </button>
              </div>

              <textarea
                rows={2}
                value={regenInstruction}
                onChange={(e) => setRegenInstruction(e.target.value)}
                placeholder="例如：改为更有视觉冲击力的一寸刀刃特写..."
                className="w-full p-2 bg-white border border-ink-950 text-xs focus:outline-none"
              />
              <button
                onClick={handleRegeneratePanel}
                disabled={isRegenerating || !regenInstruction.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                {isRegenerating ? "导演重构计算中..." : "提交单格调整"}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
