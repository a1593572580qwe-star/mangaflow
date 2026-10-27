"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import {
  FileText,
  BookOpen,
  Plus,
  Trash2,
  Users,
  ChevronRight,
  Layers,
  Sparkles,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import { MangaFormat, NarrativePacing, Character } from "@/types/storyboard";

export function Sidebar() {
  const {
    activeProject,
    activePage,
    setActivePageId,
    addPage,
    deletePage,
    updateProjectMeta,
    updatePageMeta,
    resetToDemo,
  } = useStoryboard();

  const [activeTab, setActiveTab] = useState<"pages" | "story" | "characters">("pages");

  const handleAddCharacter = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: `新登场人物`,
      role: "supporting",
      visualTraits: "外貌特征描述...",
      relation: "与主角的关系...",
    };
    updateProjectMeta({
      characters: [...activeProject.characters, newChar],
    });
  };

  const handleUpdateCharacter = (id: string, updates: Partial<Character>) => {
    const updated = activeProject.characters.map((c) => (c.id === id ? { ...c, ...updates } : c));
    updateProjectMeta({ characters: updated });
  };

  const handleDeleteCharacter = (id: string) => {
    if (activeProject.characters.length <= 1) {
      alert("请至少保留一位出场角色。");
      return;
    }
    const filtered = activeProject.characters.filter((c) => c.id !== id);
    updateProjectMeta({ characters: filtered });
  };

  return (
    <aside className="w-80 border-r-2 border-ink-950 bg-paper-100 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Tab bar */}
      <div className="flex border-b-2 border-ink-950 bg-white text-xs font-bold text-ink-700">
        <button
          onClick={() => setActiveTab("pages")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "pages"
              ? "bg-paper-100 text-ink-950 border-b-2 border-vermilion-600 -mb-0.5"
              : "hover:bg-paper-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>页面 ({activeProject.pages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("story")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "story"
              ? "bg-paper-100 text-ink-950 border-b-2 border-vermilion-600 -mb-0.5"
              : "hover:bg-paper-50"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>剧本大纲</span>
        </button>

        <button
          onClick={() => setActiveTab("characters")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "characters"
              ? "bg-paper-100 text-ink-950 border-b-2 border-vermilion-600 -mb-0.5"
              : "hover:bg-paper-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>人物 ({activeProject.characters.length})</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* PAGES TAB */}
        {activeTab === "pages" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold text-[11px] text-ink-500 uppercase tracking-wider px-1">
              <span>分页导航</span>
              <button
                onClick={addPage}
                className="flex items-center gap-1 px-2 py-0.5 bg-white border border-ink-950 hover:bg-paper-50 text-ink-950 transition-colors shadow-sm text-xs font-bold"
              >
                <Plus className="w-3 h-3" />
                加一页
              </button>
            </div>

            <div className="space-y-2">
              {activeProject.pages.map((pg) => {
                const isActive = pg.pageId === activePage?.pageId;
                return (
                  <div
                    key={pg.pageId}
                    onClick={() => setActivePageId(pg.pageId)}
                    className={`p-3 border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white border-2 border-ink-950 shadow-manga"
                        : "bg-paper-50 border-ink-300 hover:border-ink-600 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-ink-950 text-paper-50 flex items-center justify-center font-bold text-[10px] font-mono">
                          P{pg.pageNumber}
                        </span>
                        <span className="font-bold text-ink-950 truncate max-w-[140px]">
                          {pg.sceneName || `第${pg.pageNumber}页`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-ink-500 font-mono">
                          {pg.panels.length} 格
                        </span>
                        {activeProject.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`确定删除第 ${pg.pageNumber} 页及其所有分镜格吗？`)) {
                                deletePage(pg.pageId);
                              }
                            }}
                            className="p-1 text-ink-400 hover:text-rose-600 transition-colors ml-1"
                            title="删除该页"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-ink-600 line-clamp-2 leading-relaxed">
                      {pg.purpose}
                    </div>

                    <div className="mt-2 pt-2 border-t border-ink-100 flex items-center justify-between text-[10px] text-ink-500">
                      <span className="truncate max-w-[160px] text-vermilion-700 font-medium">
                        悬念：{pg.pageTurnSuspense || "未设置翻页钩子"}
                      </span>
                      <ChevronRight className="w-3 h-3 text-ink-400 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STORY TAB */}
        {activeTab === "story" && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-ink-950 mb-1">作品名称</label>
              <input
                type="text"
                value={activeProject.title}
                onChange={(e) => updateProjectMeta({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-ink-950 mb-1">当前章节名</label>
              <input
                type="text"
                value={activeProject.chapterTitle}
                onChange={(e) => updateProjectMeta({ chapterTitle: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-ink-950 mb-1">舞台与背景设定</label>
              <input
                type="text"
                value={activeProject.setting}
                onChange={(e) => updateProjectMeta({ setting: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-ink-950 mb-1">漫画格式</label>
                <select
                  value={activeProject.format}
                  onChange={(e) => updateProjectMeta({ format: e.target.value as MangaFormat })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="manga_page">日式分页 (rtl)</option>
                  <option value="webtoon">纵向条漫 (ttb)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">叙事节奏</label>
                <select
                  value={activeProject.pace}
                  onChange={(e) => updateProjectMeta({ pace: e.target.value as NarrativePacing })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="slow">舒缓留白</option>
                  <option value="normal">常规叙事</option>
                  <option value="fast">紧凑激昂</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-ink-950 mb-1">视觉风格</label>
                <select
                  value={activeProject.visualStyle}
                  onChange={(e) => updateProjectMeta({ visualStyle: e.target.value as any })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="bw_sketch">黑白草稿</option>
                  <option value="color_concept">彩色示意</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">目标总页数</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={activeProject.targetPages || 2}
                  onChange={(e) => updateProjectMeta({ targetPages: parseInt(e.target.value) || 2 })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">每页格数</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={activeProject.targetPanelsPerPage || 4}
                  onChange={(e) => updateProjectMeta({ targetPanelsPerPage: parseInt(e.target.value) || 4 })}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-ink-950 mb-1">剧情梗概 / 正文文本</label>
              <textarea
                rows={7}
                value={activeProject.synopsis}
                onChange={(e) => updateProjectMeta({ synopsis: e.target.value })}
                className="w-full p-2.5 bg-white border border-ink-950 text-xs leading-relaxed focus:outline-none resize-none"
              />
              <p className="text-[10px] text-ink-500 mt-1">
                修改后将自动保存。可随时点击顶部“剧作分析”重新提取节拍。
              </p>
            </div>
          </div>
        )}

        {/* CHARACTERS TAB */}
        {activeTab === "characters" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold text-[11px] text-ink-500 uppercase tracking-wider px-1">
              <span>出场角色谱系</span>
              <button
                onClick={handleAddCharacter}
                className="flex items-center gap-1 px-2 py-0.5 bg-white border border-ink-950 hover:bg-paper-50 text-ink-950 transition-colors shadow-sm text-xs font-bold"
              >
                <Plus className="w-3 h-3" />
                加人物
              </button>
            </div>

            <div className="space-y-3">
              {activeProject.characters.map((char) => (
                <div key={char.id} className="p-3 bg-white border border-ink-950 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => handleUpdateCharacter(char.id, { name: e.target.value })}
                      className="font-bold text-xs text-ink-950 border-b border-ink-300 focus:border-ink-950 focus:outline-none px-1 py-0.5 w-32"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={char.role}
                        onChange={(e) =>
                          handleUpdateCharacter(char.id, {
                            role: e.target.value as Character["role"],
                          })
                        }
                        className="text-[10px] border border-ink-300 px-1 py-0.5"
                      >
                        <option value="protagonist">主角</option>
                        <option value="antagonist">对手/反派</option>
                        <option value="supporting">配角</option>
                        <option value="passerby">路人/群演</option>
                      </select>
                      <button
                        onClick={() => handleDeleteCharacter(char.id)}
                        className="p-1 text-ink-400 hover:text-rose-600"
                        title="删除角色"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-ink-500 font-semibold mb-0.5">
                      外貌特征与服装标志
                    </label>
                    <input
                      type="text"
                      value={char.visualTraits}
                      onChange={(e) => handleUpdateCharacter(char.id, { visualTraits: e.target.value })}
                      className="w-full text-[11px] p-1 bg-paper-50 border border-ink-200 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-ink-500 font-semibold mb-0.5">
                      与其他角色的关系与戏剧动机
                    </label>
                    <input
                      type="text"
                      value={char.relation}
                      onChange={(e) => handleUpdateCharacter(char.id, { relation: e.target.value })}
                      className="w-full text-[11px] p-1 bg-paper-50 border border-ink-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer quick action */}
      <div className="p-3 border-t-2 border-ink-950 bg-paper-200 flex items-center justify-between text-[11px]">
        <button
          onClick={() => {
            if (confirm("确定重置为初始演示项目《雨夜电车站的偶遇》吗？")) {
              resetToDemo();
            }
          }}
          className="flex items-center gap-1 text-ink-600 hover:text-ink-950 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置为精选范例</span>
        </button>
        <span className="text-ink-400 font-mono text-[10px]">MangaFlow Studio</span>
      </div>
    </aside>
  );
}
