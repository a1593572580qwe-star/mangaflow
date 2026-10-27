"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { X, FileText, Code, Printer, Copy, Check, Download, Upload } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { activeProject, exportMarkdown, exportJson, importJson } = useStoryboard();
  const [activeTab, setActiveTab] = useState<"markdown" | "json" | "print">("markdown");
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  if (!isOpen) return null;

  const markdownContent = exportMarkdown();
  const jsonContent = exportJson();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDoImport = () => {
    setImportError("");
    const res = importJson(importText);
    if (!res.success) {
      setImportError(res.error || "导入失败，数据格式无效");
    } else {
      alert("成功导入分镜项目！");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-paper-50 border-2 border-ink-950 shadow-manga-lg w-full max-w-4xl rounded-none flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-950 bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-ink-950 text-paper-50 px-2 py-0.5 font-bold text-xs">導出</span>
            <h2 className="text-lg font-bold text-ink-950 font-manga tracking-wide">
              项目分镜稿导出与备份
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ink-100 border border-transparent hover:border-ink-950 transition-colors"
          >
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-2.5 bg-paper-100 border-b border-ink-950/20 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("markdown")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "markdown"
                  ? "bg-ink-950 text-paper-50 shadow-sm"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Markdown 脚本
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "json"
                  ? "bg-ink-950 text-paper-50 shadow-sm"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              JSON 项目数据 / 导入
            </button>
            <button
              onClick={() => setActiveTab("print")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "print"
                  ? "bg-ink-950 text-paper-50 shadow-sm"
                  : "bg-white border border-ink-300 text-ink-700 hover:bg-ink-50"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              打印排版预览
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "markdown" && (
              <>
                <button
                  onClick={() => handleCopy(markdownContent)}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-ink-950 hover:bg-ink-50 text-xs font-bold text-ink-950 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "已复制" : "复制全部"}
                </button>
                <button
                  onClick={() => handleDownload(markdownContent, `${activeProject.title}-分镜脚本.md`, "text/markdown")}
                  className="flex items-center gap-1 px-3 py-1 bg-ink-950 text-paper-50 hover:bg-vermilion-700 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载 .md 文件
                </button>
              </>
            )}

            {activeTab === "json" && (
              <>
                <button
                  onClick={() => handleCopy(jsonContent)}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-ink-950 hover:bg-ink-50 text-xs font-bold text-ink-950 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "已复制" : "复制 JSON"}
                </button>
                <button
                  onClick={() => handleDownload(jsonContent, `${activeProject.title}-分镜数据.json`, "application/json")}
                  className="flex items-center gap-1 px-3 py-1 bg-ink-950 text-paper-50 hover:bg-vermilion-700 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载 .json
                </button>
              </>
            )}

            {activeTab === "print" && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1 bg-ink-950 text-paper-50 hover:bg-vermilion-700 text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                调起系统打印 / 导出 PDF
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-sm bg-white">
          {activeTab === "markdown" && (
            <textarea
              readOnly
              value={markdownContent}
              className="w-full h-full min-h-[460px] p-4 bg-paper-50 border border-ink-950 font-mono text-xs text-ink-900 leading-relaxed focus:outline-none resize-none"
            />
          )}

          {activeTab === "json" && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-xs text-ink-950 mb-1">
                  当前项目 JSON 数据（完整结构，包含剧情分析、页面、格序与教学笔记）：
                </label>
                <textarea
                  readOnly
                  value={jsonContent}
                  className="w-full h-64 p-3 bg-paper-50 border border-ink-950 font-mono text-xs text-ink-900 leading-relaxed focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-ink-200">
                <label className="block font-bold text-xs text-ink-950 mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-vermilion-600" />
                  从 JSON 导入项目：
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="在此粘贴先前导出的 MangaFlow 项目 JSON 内容..."
                  className="w-full h-28 p-3 bg-white border border-ink-300 font-mono text-xs text-ink-900 focus:outline-none focus:border-ink-950"
                />
                {importError && <p className="text-xs text-rose-600 font-medium mt-1">{importError}</p>}
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleDoImport}
                    disabled={!importText.trim()}
                    className="px-4 py-1.5 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors disabled:opacity-40"
                  >
                    确认导入覆盖当前工作区
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "print" && (
            <div className="print-area space-y-8 max-w-3xl mx-auto p-4 border border-ink-200 bg-white shadow-sm text-ink-950 font-sans">
              {/* Title Section */}
              <div className="border-b-2 border-ink-950 pb-4 text-center">
                <h1 className="text-2xl font-black font-manga tracking-wider">{activeProject.title}</h1>
                <div className="text-xs text-ink-600 mt-1">
                  {activeProject.chapterTitle} | 格式：
                  {activeProject.format === "webtoon" ? "纵向条漫" : "日式分页漫画"} | 节奏：{activeProject.pace}
                </div>
                <div className="text-xs text-ink-700 italic mt-2 max-w-xl mx-auto">
                  {activeProject.synopsis}
                </div>
              </div>

              {/* Pages */}
              {activeProject.pages.map((pg) => (
                <div key={pg.pageId} className="page-sheet border-2 border-ink-950 p-6 space-y-6 page-break-after">
                  <div className="flex items-center justify-between border-b border-ink-950 pb-2">
                    <span className="font-bold text-sm font-manga">
                      PAGE {pg.pageNumber}：{pg.sceneName}
                    </span>
                    <span className="text-xs text-ink-600">
                      阅读流向：{pg.readingOrder === "rtl" ? "右向左 ◄" : "从上至下 ▼"} | 版式：{pg.layoutTemplate}
                    </span>
                  </div>

                  <div className="text-xs text-ink-700 bg-paper-100 p-2.5 border border-ink-300">
                    <div className="font-semibold text-ink-900">本页叙事目的：{pg.purpose}</div>
                    <div className="text-vermilion-700 font-medium mt-1">
                      ✦ 翻页悬念 (Page-turn Hook)：{pg.pageTurnSuspense}
                    </div>
                  </div>

                  {/* Panels list */}
                  <div className="space-y-4">
                    {pg.panels.map((p) => (
                      <div key={p.panelId} className="border border-ink-950 p-3 space-y-2 bg-paper-50/50">
                        <div className="flex items-center justify-between bg-ink-950 text-paper-50 px-2 py-1 text-xs font-bold">
                          <span>
                            PANEL #{p.panelNumber} · {p.shotSize} · {p.cameraAngle}
                          </span>
                          <span className="font-normal text-[11px] text-ink-300">
                            {p.composition.type}: {p.composition.description}
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-ink-900">
                          <div>
                            <span className="font-bold text-ink-950">【画面描述】</span>
                            {p.visualDescription}
                          </div>
                          <div>
                            <span className="font-bold text-ink-950">【人物站位】</span>
                            {p.characterPositions
                              .map((c) => `${c.name}@${c.position}(${c.depth}, 面向${c.facing})`)
                              .join("；")}
                          </div>
                          <div>
                            <span className="font-bold text-ink-950">【动作表情】</span>
                            {p.action} —— 表情：{p.expression}
                          </div>

                          {p.textElements.length > 0 && (
                            <div className="bg-white p-2 border border-ink-200 mt-1">
                              <span className="font-bold text-ink-950 block mb-1">【台词 / 旁白 / 音效】</span>
                              {p.textElements.map((t) => (
                                <div key={t.id} className="text-[11px] leading-relaxed">
                                  [{t.type}] <span className="font-semibold">{t.speaker}</span>：“{t.content}”
                                  <span className="text-ink-400 text-[10px] ml-1">({t.reason})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="text-[11px] text-ink-600 border-t border-ink-200 pt-1 mt-1">
                            <span className="font-semibold text-ink-800">导演教学笔记：</span>
                            {p.teachingNote.whyThisShot}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
