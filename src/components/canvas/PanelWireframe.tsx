"use client";

import React from "react";
import { StoryboardPanel, TextElement } from "@/types/storyboard";

interface PanelWireframeProps {
  panel: StoryboardPanel;
  isSelected: boolean;
}

export function PanelWireframe({ panel, isSelected }: PanelWireframeProps) {
  const { shotSize, cameraAngle, composition, characterPositions, textElements } = panel;

  // Horizon line and camera perspective parameters
  let horizonY = 50; // percentage
  let horizonRotation = 0; // degrees

  if (cameraAngle === "high_angle" || cameraAngle === "birds_eye") {
    horizonY = 25; // camera looks down, horizon is high
  } else if (cameraAngle === "low_angle") {
    horizonY = 80; // camera looks up, horizon is low
  } else if (cameraAngle === "dutch_angle") {
    horizonY = 50;
    horizonRotation = 12; // tilted Dutch angle
  }

  // Scale based on shotSize
  const getScaleFactor = () => {
    switch (shotSize) {
      case "extreme_wide":
        return 0.35;
      case "wide":
        return 0.55;
      case "medium":
        return 0.85;
      case "close_up":
        return 1.4;
      case "extreme_close_up":
      case "detail":
        return 2.1;
      default:
        return 1.0;
    }
  };

  const scale = getScaleFactor();

  // Helper for character placement coordinate
  const getCharCoords = (pos: string, depth: string, index: number, total: number) => {
    let x = 50;
    if (pos === "left" || pos === "far_left") x = total > 1 ? 28 : 35;
    else if (pos === "right" || pos === "far_right") x = total > 1 ? 72 : 65;
    else x = 50;

    let y = 62;
    let charScale = scale;

    if (depth === "background") {
      y = 48;
      charScale = scale * 0.65;
    } else if (depth === "midground") {
      y = 58;
      charScale = scale * 0.9;
    } else if (depth === "foreground") {
      y = 68;
      charScale = scale * 1.15;
    }

    return { x, y, charScale };
  };

  return (
    <div className="relative w-full h-full min-h-[160px] bg-[#fbfaf8] overflow-hidden select-none flex flex-col justify-between">
      {/* Background SVG Grid & Composition Guides */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern id={`grid-pattern-${panel.panelId}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e6e3dd" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Subtle architectural / perspective grid */}
        <rect width="100" height="100" fill={`url(#grid-pattern-${panel.panelId})`} opacity="0.6" />

        {/* Horizon Line / Perspective */}
        <line
          x1="-20"
          y1={horizonY}
          x2="120"
          y2={horizonY}
          stroke="#b8b2a8"
          strokeWidth="0.8"
          strokeDasharray="2,2"
          transform={`rotate(${horizonRotation} 50 ${horizonY})`}
        />

        {/* Vanishing Perspective Lines */}
        <line x1="0" y1="100" x2="50" y2={horizonY} stroke="#d5d0c7" strokeWidth="0.6" />
        <line x1="100" y1="100" x2="50" y2={horizonY} stroke="#d5d0c7" strokeWidth="0.6" />

        {/* Composition Specific Guides */}
        {composition.type === "rule_of_thirds" && (
          <g stroke="#cfc8bc" strokeWidth="0.4" strokeDasharray="1,1">
            <line x1="33.3" y1="0" x2="33.3" y2="100" />
            <line x1="66.6" y1="0" x2="66.6" y2="100" />
            <line x1="0" y1="33.3" x2="100" y2="33.3" />
            <line x1="0" y1="66.6" x2="100" y2="66.6" />
          </g>
        )}

        {composition.type === "diagonal" && (
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="0"
            stroke="#e07a5f"
            strokeWidth="0.8"
            strokeDasharray="2,2"
            opacity="0.7"
          />
        )}

        {composition.type === "triangular" && (
          <polygon
            points="50,15 15,90 85,90"
            fill="none"
            stroke="#cfc8bc"
            strokeWidth="0.6"
            strokeDasharray="2,2"
          />
        )}

        {composition.type === "central" && (
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="#cfc8bc"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        )}

        {/* Render Silhouette Mannequins */}
        {characterPositions.map((char, idx) => {
          const { x, y, charScale } = getCharCoords(
            char.position,
            char.depth,
            idx,
            characterPositions.length
          );

          // Head radius & body height
          const headR = Math.min(10, 4.2 * charScale);
          const headY = y - headR * 3;
          const bodyH = Math.min(45, 18 * charScale);

          return (
            <g
              key={idx}
              transform={`translate(${x}, ${headY})`}
              className="transition-transform duration-300"
            >
              {/* Head Silhouette */}
              <circle
                cx="0"
                cy="0"
                r={headR}
                fill="#27272a"
                opacity={char.depth === "background" ? "0.6" : "0.85"}
              />

              {/* Facing Indicator (Nose/Eyeline Notch) */}
              {char.facing === "left" && (
                <path d={`M ${-headR} 0 L ${-headR - 1.5} 0.8 L ${-headR} 2 Z`} fill="#27272a" />
              )}
              {char.facing === "right" && (
                <path d={`M ${headR} 0 L ${headR + 1.5} 0.8 L ${headR} 2 Z`} fill="#27272a" />
              )}

              {/* Neck & Torso Silhouette */}
              <path
                d={`M ${-headR * 0.6} ${headR * 0.9} 
                    Q 0 ${headR * 1.4} ${headR * 0.6} ${headR * 0.9} 
                    L ${headR * 1.8} ${bodyH} 
                    L ${-headR * 1.8} ${bodyH} Z`}
                fill="#3f3f46"
                opacity={char.depth === "background" ? "0.55" : "0.8"}
              />

              {/* Character Name Tag Tagged on Silhouette */}
              <text
                x="0"
                y={bodyH * 0.55}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={Math.max(2.8, Math.min(4.5, 3.2 * charScale))}
                fontWeight="bold"
                fontFamily="sans-serif"
                className="select-none"
              >
                {char.name.slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Visual Description Snippet */}
      <div className="relative z-10 p-2 text-[10px] text-ink-600 bg-white/75 backdrop-blur-[2px] border-b border-ink-200 line-clamp-1 pointer-events-none">
        <span className="font-bold text-ink-900 mr-1">情境:</span>
        {panel.action}
      </div>

      {/* Comic Speech Bubbles & SFX Overlays */}
      <div className="relative z-10 p-2 flex flex-col justify-between flex-1 pointer-events-none gap-1.5">
        {textElements.map((txt) => {
          const isSfx = txt.type === "sfx";
          const isShout = txt.type === "shout";
          const isWhisper = txt.type === "whisper";
          const isNarration = txt.type === "narration";
          const isThought = txt.type === "thought";
          const isMonologue = txt.type === "innerMonologue";
          const isOffPanel = txt.type === "offPanelDialogue";

          // Alignment based on suggestedPosition
          let alignClass = "self-start";
          if (txt.suggestedPosition.includes("right")) alignClass = "self-end";
          else if (txt.suggestedPosition === "center" || txt.suggestedPosition === "floating")
            alignClass = "self-center";

          if (isSfx) {
            return (
              <div
                key={txt.id}
                className={`${alignClass} font-black text-vermilion-600 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-tighter text-sm font-manga italic rotate-[-4deg] my-1 select-none`}
              >
                {txt.content}
              </div>
            );
          }

          if (isNarration) {
            return (
              <div
                key={txt.id}
                className={`${alignClass} bg-ink-900 text-white px-2 py-0.5 text-[10px] font-mono border border-ink-950 shadow-sm max-w-[85%]`}
              >
                <span className="text-ink-400 font-bold mr-1">[{txt.speaker}]</span>
                {txt.content}
              </div>
            );
          }

          if (isMonologue) {
            return (
              <div
                key={txt.id}
                className={`${alignClass} bg-purple-50/95 text-ink-900 px-2 py-1 text-[10px] border border-purple-400 border-dashed rounded shadow-sm max-w-[85%] italic`}
              >
                <span className="text-purple-700 font-bold mr-1 font-sans">【独白】{txt.speaker}:</span>
                {txt.content}
              </div>
            );
          }

          if (isThought) {
            return (
              <div
                key={txt.id}
                className={`${alignClass} relative bg-white/95 text-ink-900 px-2.5 py-1 text-[10px] border border-blue-400 rounded-2xl shadow-sm max-w-[85%] italic`}
              >
                <span className="text-blue-600 font-bold mr-1 font-sans">💭 {txt.speaker}:</span>
                {txt.content}
                <div className="absolute -bottom-1 left-4 w-1.5 h-1.5 rounded-full bg-blue-400" />
                <div className="absolute -bottom-2.5 left-3 w-1 h-1 rounded-full bg-blue-300" />
              </div>
            );
          }

          return (
            <div
              key={txt.id}
              className={`${alignClass} relative bg-white text-ink-950 px-2 py-1 text-[10px] border shadow-sm max-w-[85%] rounded-lg ${
                isShout
                  ? "border-2 border-red-600 font-bold bg-yellow-50"
                  : isWhisper
                  ? "border-dashed border-ink-400 text-ink-700 bg-paper-50"
                  : isOffPanel
                  ? "border-amber-400 bg-amber-50/90"
                  : "border-ink-950"
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-[9px] text-ink-500 mb-0.5">
                <span>{txt.speaker}</span>
                {isOffPanel && <span className="text-amber-700">(画外)</span>}
              </div>
              <div className="leading-tight break-words">{txt.content}</div>

              {/* Comic bubble arrow/tail */}
              <div
                className={`absolute w-0 h-0 border-solid pointer-events-none ${
                  txt.suggestedPosition.includes("right")
                    ? "-bottom-1.5 right-3 border-t-[6px] border-t-ink-950 border-r-[6px] border-r-transparent border-l-0"
                    : "-bottom-1.5 left-3 border-t-[6px] border-t-ink-950 border-l-[6px] border-l-transparent border-r-0"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Technical Bar */}
      <div className="relative z-10 px-2 py-1 bg-paper-100/90 border-t border-ink-200 text-[10px] text-ink-500 flex items-center justify-between pointer-events-none">
        <span className="truncate max-w-[130px] font-mono">{composition.description}</span>
        <span className="font-semibold text-ink-700">{panel.lightingAndMood?.slice(0, 8)}</span>
      </div>
    </div>
  );
}
