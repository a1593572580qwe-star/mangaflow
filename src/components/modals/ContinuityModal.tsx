"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { X, CheckCircle, AlertTriangle, ShieldAlert, Sparkles, RotateCw } from "lucide-react";

interface ContinuityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContinuityReport {
  score: number;
  overallAssessment: string;
  continuityIssues: Array<{
    location: string;
    severity: "high" | "medium" | "low";
    issueType: string;
    description: string;
    suggestion: string;
  }>;
  shotVarietyScore: string;
  pacingPraise: string;
  actionableImprovements: string[];
}

export function ContinuityModal({ isOpen, onClose }: ContinuityModalProps) {
  const { activeProject, apiConfig } = useStoryboard();
  const [report, setReport] = useState<ContinuityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleRunCheck = async () => {
    setIsChecking(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: activeProject,
          apiConfig: apiConfig.isCustomConfigured ? apiConfig : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "审查失败");
      }

      setReport(data.report);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "连贯性审查失败");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-paper-50 border-2 border-ink-950 shadow-manga-lg w-full max-w-2xl rounded-none flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-950 bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-ink-950 text-paper-50 px-2 py-0.5 font-bold text-xs">監修</span>
            <h2 className="text-lg font-bold text-ink-950 font-manga tracking-wide">
              分镜连贯性与专业度总编审查
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ink-100 border border-transparent hover:border-ink-950 transition-colors"
          >
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm bg-white">
          {!report && !isChecking && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 border-2 border-ink-950 bg-paper-100 flex items-center justify-center mx-auto text-ink-800 shadow-manga">
                <ShieldAlert className="w-6 h-6 text-vermilion-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-ink-950 text-base">启动全篇连贯性与视线轴线审查</h3>
                <p className="text-xs text-ink-600 max-w-md mx-auto leading-relaxed">
                  资深漫画总编将针对 180 度轴线规则（视线穿帮）、镜头景别丰富度、台词遗漏和节奏拖沓展开全面体检。
                </p>
              </div>
              <button
                onClick={handleRunCheck}
                className="px-5 py-2 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-manga"
              >
                立即开始审查
              </button>
            </div>
          )}

          {isChecking && (
            <div className="py-12 text-center space-y-3">
              <RotateCw className="w-8 h-8 animate-spin text-ink-950 mx-auto" />
              <p className="font-bold text-ink-950">正在逐格核对人物站位、视线与节奏连贯度...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          {report && !isChecking && (
            <div className="space-y-5">
              {/* Score card */}
              <div className="flex items-center justify-between p-4 bg-paper-100 border border-ink-950">
                <div>
                  <div className="text-xs text-ink-600 font-bold">分镜专业度综合评分</div>
                  <div className="text-3xl font-black font-manga text-ink-950 mt-1">
                    {report.score} <span className="text-xs font-normal text-ink-500">/ 100 分</span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-emerald-700 block">
                    景别梯度：{report.shotVarietyScore}
                  </span>
                  <span className="text-ink-600 mt-0.5 block">{report.pacingPraise}</span>
                </div>
              </div>

              {/* Assessment */}
              <div className="text-xs text-ink-800 bg-paper-50 p-3 border border-ink-200 leading-relaxed">
                <span className="font-bold text-ink-950">总编总评：</span>
                {report.overallAssessment}
              </div>

              {/* Issues list */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-ink-950 border-b border-ink-200 pb-1.5">
                  待优化细节与潜在穿帮 ({report.continuityIssues.length})
                </h4>
                {report.continuityIssues.map((issue, idx) => (
                  <div key={idx} className="p-3 border border-ink-300 bg-paper-50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-950">{issue.location}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 font-bold ${
                          issue.severity === "high"
                            ? "bg-rose-100 text-rose-800"
                            : issue.severity === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-ink-200 text-ink-800"
                        }`}
                      >
                        {issue.severity === "high" ? "需重点调整" : "优化建议"}
                      </span>
                    </div>
                    <div className="text-ink-700">{issue.description}</div>
                    <div className="text-emerald-800 font-medium">✦ 建议修改：{issue.suggestion}</div>
                  </div>
                ))}
              </div>

              {/* Actionable items */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-ink-950">作画落实清单：</h4>
                <ul className="list-disc list-inside text-xs text-ink-700 space-y-1">
                  {report.actionableImprovements.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-ink-950 bg-paper-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-ink-300 hover:bg-ink-100 text-ink-700 text-xs font-medium transition-colors"
          >
            关闭
          </button>
          {report && (
            <button
              onClick={handleRunCheck}
              disabled={isChecking}
              className="px-4 py-1.5 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors"
            >
              重新审查
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
