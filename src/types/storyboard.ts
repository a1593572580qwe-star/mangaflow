import { z } from "zod";

// Text element types in comic storytelling
export type TextElementType =
  | "dialogue" // 普通对白
  | "offPanelDialogue" // 画外音/画外对白 (说话者不在画面中)
  | "narration" // 旁白/叙述说明
  | "innerMonologue" // 内心独白
  | "thought" // 思考内容
  | "sfx" // 拟声词/动作音效
  | "whisper" // 低语/气声
  | "shout"; // 呐喊/震惊大声

// Shot sizes in manga directing
export type ShotSize =
  | "extreme_wide" // 大远景 (交代环境、宏大氛围、孤独感)
  | "wide" // 远景/全景 (交代人物与空间关系、走位)
  | "medium" // 中景 (半身至膝部，标准对话、身体互动)
  | "close_up" // 近景 (胸部以上，人物微表情与情绪)
  | "extreme_close_up" // 面部特写/眼神特写 (心理高潮、震撼瞬间)
  | "detail"; // 局部特写 (关键道具、手指颤抖、水滴、线索)

// Camera angles
export type CameraAngle =
  | "eye_level" // 平视 (客观、稳定、自然)
  | "low_angle" // 仰角/仰视 (威慑感、高大、紧迫、崇高)
  | "high_angle" // 俯角/俯视 (无助、被审视、全局掌控、压抑)
  | "dutch_angle" // 倾斜构图 (心理失衡、危机、眩晕、不安)
  | "over_the_shoulder" // 过肩镜头 (对话中的主客关系与空间深度)
  | "birds_eye"; // 鸟瞰 (完全俯瞰的抽象格局或地图感)

// Composition styles
export type CompositionType =
  | "rule_of_thirds" // 三分法
  | "diagonal" // 对角线构图 (动感、冲突)
  | "central" // 居中对称 (仪式感、冲击力)
  | "triangular" // 三角形构图 (稳定或压迫)
  | "silhouette" // 剪影/负空间 (神秘感、情绪留白)
  | "framing" // 框架式构图 (门框、窗户、受困感)
  | "leading_lines"; // 引导线构图 (视线引导)

// Page layout templates
export type LayoutTemplate =
  | "focus_top" // 顶部大画格 (揭示场景或大特写) + 下方3格
  | "focus_bottom" // 上方铺垫 + 底部跨页/大格爆点
  | "grid_4" // 经典四格/匀称分格
  | "dynamic_action" // 倾斜/动感斜切格
  | "split_horizontal" // 宽幅横条大格组合
  | "cinematic_widescreen" // 电影感宽画幅 3 段
  | "vertical_strip"; // 条漫纵向单列/双列流动

export interface CharacterPlacement {
  name: string;
  position: "left" | "center" | "right" | "far_left" | "far_right";
  depth: "foreground" | "midground" | "background";
  facing: "left" | "right" | "front" | "back" | "three_quarters";
  posture: string;
}

export interface AlternativeShot {
  title: string;
  shotSize: ShotSize;
  cameraAngle: CameraAngle;
  composition: string;
  pros: string;
  cons: string;
  visualDescription: string;
  drawingNotes: string;
}

export interface TeachingNote {
  whyThisShot: string; // 为什么选择此景别和视角
  readerFocus: string; // 希望读者首先注意什么
  emotionAndPacing: string; // 本格如何表达情绪或推进剧情
  panelTransitionLogic: string; // 与前后漫画格的衔接逻辑
  textVisualBalance: string; // 旁白、对白和画面之间如何分工
  alternativeShots: AlternativeShot[]; // 2种替代方案
}

export interface TextElement {
  id: string;
  speaker: string;
  content: string;
  type: TextElementType;
  suggestedStyle: string; // 如：矩形黑底白字、波浪思考泡、尖角呐喊泡
  suggestedPosition: "top_right" | "top_left" | "center" | "bottom_left" | "bottom_right" | "floating";
  readingPriority: number; // 阅读先后顺序 1, 2, 3...
  reason: string; // 为什么建议此表现方式
}

export interface StoryboardPanel {
  panelId: string;
  panelNumber: number; // 1-indexed within page
  narrationPurpose: string; // 本格叙事目的
  shotSize: ShotSize;
  cameraAngle: CameraAngle;
  composition: {
    type: CompositionType;
    description: string;
    focalPoint: string;
  };
  characterPositions: CharacterPlacement[];
  action: string; // 动作与关键瞬间
  expression: string; // 表情与情绪
  background: string; // 环境与背景细节
  lightingAndMood: string; // 光线与氛围 (如：背光剪影、斜阳雨丝)
  visualDescription: string; // 供漫画绘制者使用的完整画面描述
  textElements: TextElement[];
  transition: string; // 与前后格衔接 (例如：主观视角切入、跳切动作结果)
  drawingNotes: string; // 绘制要点与提示
  teachingNote: TeachingNote;
  aspectRatio?: string; // 默认或者自定义长宽比
}

export interface StoryboardPage {
  pageId: string;
  pageNumber: number;
  sceneName: string;
  purpose: string; // 本页叙事目的
  readingOrder: "rtl" | "ltr" | "ttb"; // 日式从右至左 (rtl) 或 条漫从上至下 (ttb)
  layoutTemplate: LayoutTemplate;
  visualFocalPoint: string; // 本页视觉重心
  pageTurnSuspense: string; // 翻页悬念/节奏安排 (左页底格的钩子)
  panels: StoryboardPanel[];
}

export interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "passerby";
  visualTraits: string; // 外貌特征、服装、发型
  relation: string; // 与其他人物的关系
}

export interface StoryAnalysisBeat {
  beatType: "revelation" | "climax" | "pause" | "foreshadowing" | "cliffhanger" | "character_moment";
  title: string;
  description: string;
  suggestedTreatment: string; // 建议的视觉分镜处理 (例如：静止大格、背影特写)
}

export interface StoryAnalysis {
  events: string[]; // 因果事件链
  sceneBreaks: Array<{
    sceneId: string;
    heading: string;
    purpose: string;
    timeAndSetting: string;
  }>;
  characterArcs: Array<{
    characterName: string;
    emotionShift: string;
    keyAction: string;
  }>;
  keyBeats: StoryAnalysisBeat[];
  visualPointers: string[]; // 适合画面展现的信息 (Show, Don't Tell)
  textPointers: string[]; // 必须通过文字/旁白交代的细节
  pauseAndRevealMoments: string[]; // 适合停顿、特写或翻页揭示的时刻
  narrativeAdvice: string; // 整体节奏导演建议
}

export type MangaFormat = "manga_page" | "webtoon";
export type NarrativePacing = "slow" | "normal" | "fast";
export type VisualStyle = "bw_sketch" | "color_concept";

export interface Project {
  id: string;
  title: string;
  synopsis: string;
  chapterTitle: string;
  characters: Character[];
  setting: string;
  genre: string;
  format: MangaFormat;
  targetPages: number;
  targetPanelsPerPage: number;
  pace: NarrativePacing;
  visualStyle: VisualStyle;
  analysis: StoryAnalysis | null;
  pages: StoryboardPage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  isCustomConfigured: boolean;
}

// Zod Validation Schemas
export const CharacterPlacementSchema = z.object({
  name: z.string(),
  position: z.enum(["left", "center", "right", "far_left", "far_right"]),
  depth: z.enum(["foreground", "midground", "background"]),
  facing: z.enum(["left", "right", "front", "back", "three_quarters"]),
  posture: z.string(),
});

export const AlternativeShotSchema = z.object({
  title: z.string(),
  shotSize: z.enum(["extreme_wide", "wide", "medium", "close_up", "extreme_close_up", "detail"]),
  cameraAngle: z.enum(["eye_level", "low_angle", "high_angle", "dutch_angle", "over_the_shoulder", "birds_eye"]),
  composition: z.string(),
  pros: z.string(),
  cons: z.string(),
  visualDescription: z.string(),
  drawingNotes: z.string(),
});

export const TeachingNoteSchema = z.object({
  whyThisShot: z.string(),
  readerFocus: z.string(),
  emotionAndPacing: z.string(),
  panelTransitionLogic: z.string(),
  textVisualBalance: z.string(),
  alternativeShots: z.array(AlternativeShotSchema),
});

export const TextElementSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  content: z.string(),
  type: z.enum(["dialogue", "offPanelDialogue", "narration", "innerMonologue", "thought", "sfx", "whisper", "shout"]),
  suggestedStyle: z.string(),
  suggestedPosition: z.enum(["top_right", "top_left", "center", "bottom_left", "bottom_right", "floating"]),
  readingPriority: z.number(),
  reason: z.string(),
});

export const StoryboardPanelSchema = z.object({
  panelId: z.string(),
  panelNumber: z.number(),
  narrationPurpose: z.string(),
  shotSize: z.enum(["extreme_wide", "wide", "medium", "close_up", "extreme_close_up", "detail"]),
  cameraAngle: z.enum(["eye_level", "low_angle", "high_angle", "dutch_angle", "over_the_shoulder", "birds_eye"]),
  composition: z.object({
    type: z.enum(["rule_of_thirds", "diagonal", "central", "triangular", "silhouette", "framing", "leading_lines"]),
    description: z.string(),
    focalPoint: z.string(),
  }),
  characterPositions: z.array(CharacterPlacementSchema),
  action: z.string(),
  expression: z.string(),
  background: z.string(),
  lightingAndMood: z.string(),
  visualDescription: z.string(),
  textElements: z.array(TextElementSchema),
  transition: z.string(),
  drawingNotes: z.string(),
  teachingNote: TeachingNoteSchema,
});

export const StoryboardPageSchema = z.object({
  pageId: z.string(),
  pageNumber: z.number(),
  sceneName: z.string(),
  purpose: z.string(),
  readingOrder: z.enum(["rtl", "ltr", "ttb"]),
  layoutTemplate: z.enum([
    "focus_top",
    "focus_bottom",
    "grid_4",
    "dynamic_action",
    "split_horizontal",
    "cinematic_widescreen",
    "vertical_strip",
  ]),
  visualFocalPoint: z.string(),
  pageTurnSuspense: z.string(),
  panels: z.array(StoryboardPanelSchema),
});

export const StoryAnalysisSchema = z.object({
  events: z.array(z.string()),
  sceneBreaks: z.array(
    z.object({
      sceneId: z.string(),
      heading: z.string(),
      purpose: z.string(),
      timeAndSetting: z.string(),
    })
  ),
  characterArcs: z.array(
    z.object({
      characterName: z.string(),
      emotionShift: z.string(),
      keyAction: z.string(),
    })
  ),
  keyBeats: z.array(
    z.object({
      beatType: z.enum(["revelation", "climax", "pause", "foreshadowing", "cliffhanger", "character_moment"]),
      title: z.string(),
      description: z.string(),
      suggestedTreatment: z.string(),
    })
  ),
  visualPointers: z.array(z.string()),
  textPointers: z.array(z.string()),
  pauseAndRevealMoments: z.array(z.string()),
  narrativeAdvice: z.string(),
});
