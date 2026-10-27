"use client";

import React from "react";
import { StoryboardProvider } from "@/lib/store/storyboardContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StoryboardCanvas } from "@/components/canvas/StoryboardCanvas";
import { PanelInspector } from "@/components/inspector/PanelInspector";

export default function Home() {
  return (
    <StoryboardProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-paper-100">
        {/* Top Navigation & Status Bar */}
        <Header />

        {/* Studio Workspace Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Project & Navigation */}
          <Sidebar />

          {/* Center: Storyboard Canvas */}
          <StoryboardCanvas />

          {/* Right: Panel Inspector & Director Teaching */}
          <PanelInspector />
        </div>
      </div>
    </StoryboardProvider>
  );
}
