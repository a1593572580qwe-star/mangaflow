import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MangaFlow 漫画分镜工坊 - 专业 AI 漫画视觉叙事工作台",
  description:
    "面向漫画编剧与画师的专业分镜辅助系统。融合日式分镜演出法、景别构图推荐、台词与画外音气泡设计、翻页悬念设置及分镜教学解析。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper-100 flex flex-col overflow-hidden">
        {children}
      </body>
    </html>
  );
}
