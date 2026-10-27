"use client";

import React from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { PageCanvas } from "@/components/canvas/PageCanvas";
import { Plus, BookOpen, Layers } from "lucide-react";

export function StoryboardCanvas() {
  const { activeProject, activePage, zoomLevel, addPage } = useStoryboard();

  if (!activeProject || !activeProject.pages || activeProject.pages.length === 0) {
    return (
      <main className="flex-1 bg-paper-200 flex items-center justify-center p-8 select-none">
        <div className="bg-white border-2 border-ink-950 p-8 max-w-md text-center shadow-manga space-y-4">
          <div className="w-12 h-12 bg-paper-100 border border-ink-950 flex items-center justify-center mx-auto text-ink-950 font-bold">
            <BookOpen className="w-6 h-6 text-vermilion-600" />
          </div>
          <h3 className="font-bold text-base text-ink-950">企划中暂无分镜页面</h3>
          <p className="text-xs text-ink-600 leading-relaxed">
            您可以点击下方按钮添加第一页漫画画布，或点击顶部“生成分页分镜”由 AI 协助展开绘制。
          </p>
          <button
            onClick={addPage}
            className="flex items-center gap-1.5 px-4 py-2 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 mx-auto transition-colors shadow-manga"
          >
            <Plus className="w-4 h-4" />
            新建第一页
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-paper-200 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
      <div
        className="w-full transition-transform duration-200 origin-top flex flex-col items-center"
        style={{
          transform: `scale(${zoomLevel / 100})`,
        }}
      >
        {/* Render Active Page */}
        {activePage && (
          <PageCanvas
            page={activePage}
            pageIndex={activeProject.pages.findIndex((p) => p.pageId === activePage.pageId)}
          />
        )}
      </div>
    </main>
  );
}
