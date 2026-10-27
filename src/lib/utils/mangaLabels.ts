import { ShotSize, CameraAngle, TextElementType, CompositionType } from "@/types/storyboard";

export const SHOT_SIZE_LABELS: Record<ShotSize, { label: string; desc: string }> = {
  extreme_wide: { label: "大远景 (EWS)", desc: "宏大环境、天地气氛、极度孤独感与世界观交代" },
  wide: { label: "远景/全景 (WS)", desc: "交代人物与周边空间关系、站位走位与整体动态" },
  medium: { label: "中景 (MS)", desc: "半身至膝部，标准的对话、肢体互动与日常动作" },
  close_up: { label: "近景 (CU)", desc: "胸部以上，聚焦人物微表情、情绪波动与心理反应" },
  extreme_close_up: { label: "面部特写 (ECU)", desc: "眼神瞳孔、嘴唇颤抖，戏剧最高潮或震撼瞬间" },
  detail: { label: "局部特写 (Detail)", desc: "关键道具、信件、刀刃、手指滴血等核心线索" },
};

export const CAMERA_ANGLE_LABELS: Record<CameraAngle, { label: string; desc: string }> = {
  eye_level: { label: "平视 (Eye Level)", desc: "客观自然、视平线平齐、阅读稳定舒适" },
  low_angle: { label: "仰角 (Low Angle)", desc: "由下往上，赋予角色威严、高大、压迫感或崇高感" },
  high_angle: { label: "俯角 (High Angle)", desc: "由上往下，体现角色渺小、受困、压抑或被审视" },
  dutch_angle: { label: "倾斜构图 (Dutch)", desc: "画面倾斜失衡，表现危机、眩晕、精神动荡或失控" },
  over_the_shoulder: { label: "过肩镜头 (OTS)", desc: "隔着一人肩膀看对方，确立双人对话深度与主客关系" },
  birds_eye: { label: "鸟瞰 (Bird's Eye)", desc: "垂直下视，地图般的宏观调度或抽象秩序感" },
};

export const COMPOSITION_LABELS: Record<CompositionType, { label: string; desc: string }> = {
  rule_of_thirds: { label: "三分法构图", desc: "主体置于黄金交叉点，画面呼吸感强" },
  diagonal: { label: "对角线构图", desc: "打破平衡，充满动势、速度感与冲突对峙" },
  central: { label: "居中对称构图", desc: "庄重、仪式感强，视觉冲击直接集中" },
  triangular: { label: "三角形构图", desc: "底宽顶尖，极具稳固感或山岳般的压迫感" },
  silhouette: { label: "剪影与负空间", desc: "逆光全黑剪影，大面积留白，意境深沉" },
  framing: { label: "框式构图", desc: "借助门框、窗户、栏杆形成画中画，营造窥视或囚困感" },
  leading_lines: { label: "引导线构图", desc: "利用道路、铁轨、透视线条强行引导视线" },
};

export const TEXT_TYPE_LABELS: Record<TextElementType, { label: string; badgeClass: string; icon: string }> = {
  dialogue: { label: "对白 (Dialogue)", badgeClass: "bg-ink-100 text-ink-900 border-ink-300", icon: "💬" },
  offPanelDialogue: { label: "画外音 (Off-Panel)", badgeClass: "bg-amber-50 text-amber-900 border-amber-300", icon: "📢" },
  narration: { label: "旁白 (Narration)", badgeClass: "bg-blue-50 text-blue-900 border-blue-300", icon: "📜" },
  innerMonologue: { label: "内心独白 (Monologue)", badgeClass: "bg-purple-50 text-purple-900 border-purple-300", icon: "💭" },
  thought: { label: "思考 (Thought)", badgeClass: "bg-indigo-50 text-indigo-900 border-indigo-300", icon: "💡" },
  sfx: { label: "拟声词 (SFX)", badgeClass: "bg-vermilion-50 text-vermilion-700 border-vermilion-300 font-bold", icon: "⚡" },
  whisper: { label: "低语 (Whisper)", badgeClass: "bg-gray-100 text-gray-700 border-dashed border-gray-400", icon: "🤫" },
  shout: { label: "呐喊 (Shout)", badgeClass: "bg-red-100 text-red-900 border-red-500 font-bold", icon: "💥" },
};
