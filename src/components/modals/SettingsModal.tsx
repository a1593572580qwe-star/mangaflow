"use client";

import React, { useState, useEffect } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { X, Key, Globe, Cpu, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiConfig, updateApiConfig } = useStoryboard();
  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [model, setModel] = useState(apiConfig.model);
  const [serverEnvStatus, setServerEnvStatus] = useState<{
    isConfigured: boolean;
    baseUrl: string;
    model: string;
    hasApiKey: boolean;
  } | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setBaseUrl(apiConfig.baseUrl);
      setApiKey(apiConfig.apiKey);
      setModel(apiConfig.model);

      // Check server environment variables status
      fetch("/api/ai/config")
        .then((res) => res.json())
        .then((data) => setServerEnvStatus(data))
        .catch(() => {});
    }
  }, [isOpen, apiConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateApiConfig({
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
      isCustomConfigured: Boolean(apiKey.trim()),
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setTestMessage("正在测试连接与鉴权...");

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            title: "连接测试",
            synopsis: "测试分镜引擎的响应与可用性。",
            characters: [{ id: "c1", name: "测试者", role: "protagonist", visualTraits: "无", relation: "无" }],
            genre: "剧情",
            format: "manga_page",
          },
          apiConfig: {
            baseUrl: baseUrl.trim(),
            apiKey: apiKey.trim(),
            model: model.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "请求失败");
      }

      if (data.isDemoMode) {
        setTestStatus("idle");
        setTestMessage("未填入有效的远程 API Key，系统将平稳运行于内置高质量【演示模式】。");
      } else {
        setTestStatus("success");
        setTestMessage(`连接成功！远程模型【${model}】响应正常，分镜输出已通过 Zod 结构校验。`);
      }
    } catch (err: unknown) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "连接失败，请检查 Base URL 与 API Key。");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-paper-50 border-2 border-ink-950 shadow-manga-lg w-full max-w-xl rounded-none flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-950 bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-ink-950 text-paper-50 px-2 py-0.5 font-bold text-xs">設定</span>
            <h2 className="text-lg font-bold text-ink-950 font-manga tracking-wide">AI 引擎与接口配置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ink-100 border border-transparent hover:border-ink-950 transition-colors"
          >
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Banner */}
          <div className="p-4 border border-ink-950 bg-paper-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-vermilion-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-ink-950 text-sm">双模运行保障说明</div>
              <p className="text-ink-700 leading-relaxed">
                <span className="font-bold text-ink-900">演示模式（免 Key）：</span>
                无需任何配置或花费，系统内置专业的分镜推导生成器，完整呈现结构化剧情拆解与导演分镜教学。
              </p>
              <p className="text-ink-700 leading-relaxed">
                <span className="font-bold text-ink-900">在线 AI 模式：</span>
                支持任何兼容 OpenAI 协议的接口（如 OpenAI、DeepSeek、Moonshot、通义千问等）。支持通过本地{" "}
                <code className="bg-white px-1 border border-ink-300 font-mono text-[11px]">.env.local</code>{" "}
                文件配置，也可在此界面直接临时录入。
              </p>
            </div>
          </div>

          {/* Server Env Check */}
          {serverEnvStatus && (
            <div className="p-3 bg-white border border-ink-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-ink-500">本地 .env.local 状态：</span>
                {serverEnvStatus.hasApiKey ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已检测到服务端 API Key
                  </span>
                ) : (
                  <span className="text-ink-500 font-medium flex items-center gap-1">
                    未检测到环境变量（使用演示模式或下方填入）
                  </span>
                )}
              </div>
              <span className="text-ink-400 font-mono text-[11px]">{serverEnvStatus.model}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-ink-900 mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-ink-600" />
                API Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 font-mono text-xs"
              />
              <p className="text-[11px] text-ink-500 mt-1">
                环境变量名：<code className="bg-ink-100 px-1 font-mono">STORYBOARD_BASE_URL</code>
              </p>
            </div>

            <div>
              <label className="block font-bold text-ink-900 mb-1 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-ink-600" />
                API Key (密钥)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 font-mono text-xs"
              />
              <p className="text-[11px] text-ink-500 mt-1">
                环境变量名：<code className="bg-ink-100 px-1 font-mono">STORYBOARD_API_KEY</code>{" "}
                （留空则自动启用免 Key 演示模式）
              </p>
            </div>

            <div>
              <label className="block font-bold text-ink-900 mb-1 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-ink-600" />
                模型名称 (Model)
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini 或 deepseek-chat 等"
                className="w-full px-3 py-2 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 font-mono text-xs"
              />
              <p className="text-[11px] text-ink-500 mt-1">
                环境变量名：<code className="bg-ink-100 px-1 font-mono">STORYBOARD_MODEL</code>
              </p>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testMessage && (
            <div
              className={`p-3 border text-xs flex items-start gap-2 ${
                testStatus === "success"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                  : testStatus === "error"
                  ? "bg-rose-50 border-rose-500 text-rose-900"
                  : "bg-paper-100 border-ink-400 text-ink-800"
              }`}
            >
              {testStatus === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
              {testStatus === "error" && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
              <div className="leading-relaxed">{testMessage}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-ink-950 bg-paper-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === "testing"}
            className="px-3 py-1.5 border border-ink-950 bg-white hover:bg-ink-50 font-medium text-xs text-ink-950 transition-colors disabled:opacity-50"
          >
            {testStatus === "testing" ? "测试中..." : "测试连接"}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-ink-300 hover:bg-ink-100 text-ink-700 text-xs font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-manga"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
