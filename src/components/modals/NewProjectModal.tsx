"use client";

import React, { useState } from "react";
import { useStoryboard } from "@/lib/store/storyboardContext";
import { X, Sparkles, Plus, BookOpen, Users, Trash2 } from "lucide-react";
import { MangaFormat, NarrativePacing, VisualStyle, Character } from "@/types/storyboard";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    title: "雨夜电车站的偶遇",
    genre: "悬疑 / 心理 / 青春",
    pace: "normal" as NarrativePacing,
    format: "manga_page" as MangaFormat,
    visualStyle: "bw_sketch" as VisualStyle,
    setting: "现代近郊单轨高架电车站，夜晚暴雨，微弱白炽灯与积水倒影",
    synopsis:
      "深夜暴雨的单轨电车站，高三学生林澈正握着藏在怀里的退学信。同班一直沉默寡言的班长苏晓晴护着神秘纸箱冲入站台，两人视线在雷鸣中交汇，秘密即将曝光。",
    characters: [
      { id: "c1", name: "林澈", role: "protagonist" as const, visualTraits: "黑色微卷短发，深色高专制服，常低头掩饰眼神", relation: "准备退学的少年" },
      { id: "c2", name: "苏晓晴", role: "protagonist" as const, visualTraits: "黑框眼镜，长黑发湿透贴在颈侧，神情戒备而倔强", relation: "察觉异样的同班班长" },
    ],
  },
  {
    title: "深空穿梭机的最后指令",
    genre: "科幻 / 惊悚",
    pace: "fast" as NarrativePacing,
    format: "manga_page" as MangaFormat,
    visualStyle: "bw_sketch" as VisualStyle,
    setting: "深空勘探舰检修仓与减压气闸舱，红色应急警报闪烁",
    synopsis:
      "勘探舰发生氧气泄漏警报，领航员艾登在检修仓发现了被蓄意切断的输送管，而副舰长正反锁了唯一的减压舱门，隔着强化玻璃静静注视着他。",
    characters: [
      { id: "c1", name: "艾登", role: "protagonist" as const, visualTraits: "身穿破损机械外骨骼航天服，满头冷汗", relation: "被困在减压舱的领航员" },
      { id: "c2", name: "诺兰", role: "antagonist" as const, visualTraits: "冰冷整洁的统领制服，眼神冷漠无情", relation: "反锁舱门的副舰长" },
    ],
  },
  {
    title: "武道宗师与断剑之约",
    genre: "热血 / 武侠",
    pace: "fast" as NarrativePacing,
    format: "manga_page" as MangaFormat,
    visualStyle: "bw_sketch" as VisualStyle,
    setting: "黄昏绝壁之巅，万丈深渊与枯松石阶，晚风呼啸",
    synopsis:
      "黄昏绝壁之巅，昔日并肩作战的师兄弟重逢。一人手中只有半截生锈断剑，另一人已是名震天下的御林统领。风起，落叶断，拔刀只在一瞬。",
    characters: [
      { id: "c1", name: "陆青锋", role: "protagonist" as const, visualTraits: "粗麻布衣，斗笠微压，手持半截缺口断剑", relation: "流浪江湖的师弟" },
      { id: "c2", name: "萧凌", role: "antagonist" as const, visualTraits: "金丝黑袍，腰悬御赐玄铁长刀，面容威严", relation: "掌管禁卫军的师兄" },
    ],
  },
  {
    title: "放学后的无声图书馆",
    genre: "日常 / 恋爱",
    pace: "slow" as NarrativePacing,
    format: "manga_page" as MangaFormat,
    visualStyle: "color_concept" as VisualStyle,
    setting: "斜阳穿透的市立图书馆二楼藏书区，尘埃在金色光柱中浮动",
    synopsis:
      "斜阳穿过图书馆落地窗，空气中漂浮着细尘。隔着书架缝隙，女孩正在垫脚够一本高处的画集，男孩从另一侧无声替她扶住了书脊，四目透过书架相撞。",
    characters: [
      { id: "c1", name: "夏至", role: "protagonist" as const, visualTraits: "白色棉麻连衣裙，编发，神情轻柔专注", relation: "插画社高二少女" },
      { id: "c2", name: "顾言", role: "supporting" as const, visualTraits: "衬衫挽起衣袖，戴银丝眼镜，手指修长", relation: "图书馆值日少年" },
    ],
  },
];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createNewProject } = useStoryboard();
  const [title, setTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("第一话：序幕");
  const [synopsis, setSynopsis] = useState("");
  const [genre, setGenre] = useState("悬疑");
  const [format, setFormat] = useState<MangaFormat>("manga_page");
  const [pace, setPace] = useState<NarrativePacing>("normal");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("bw_sketch");
  const [setting, setSetting] = useState("现代近郊或架空都市");
  const [targetPages, setTargetPages] = useState(2);
  const [targetPanelsPerPage, setTargetPanelsPerPage] = useState(4);
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: "char-1",
      name: "主角",
      role: "protagonist",
      visualTraits: "年轻少年，身穿常服，眼神清澈",
      relation: "核心主角",
    },
  ]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setGenre(tmpl.genre);
    setPace(tmpl.pace);
    setFormat(tmpl.format);
    setVisualStyle(tmpl.visualStyle);
    setSetting(tmpl.setting);
    setSynopsis(tmpl.synopsis);
    setCharacters(tmpl.characters);
  };

  const handleAddCharacter = () => {
    setCharacters([
      ...characters,
      {
        id: `char-${Date.now()}`,
        name: `角色${characters.length + 1}`,
        role: "supporting",
        visualTraits: "外貌特征描述...",
        relation: "与主角关系...",
      },
    ]);
  };

  const handleRemoveCharacter = (idx: number) => {
    if (characters.length <= 1) return;
    setCharacters(characters.filter((_, i) => i !== idx));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("请输入作品标题");
      return;
    }
    if (!synopsis.trim()) {
      alert("请输入故事大纲或剧情文本");
      return;
    }

    createNewProject({
      title: title.trim(),
      chapterTitle: chapterTitle.trim(),
      synopsis: synopsis.trim(),
      genre,
      format,
      pace,
      visualStyle,
      setting: setting.trim(),
      targetPages,
      targetPanelsPerPage,
      characters,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-paper-50 border-2 border-ink-950 shadow-manga-lg w-full max-w-2xl rounded-none flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-950 bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-ink-950 text-paper-50 px-2 py-0.5 font-bold text-xs">新規</span>
            <h2 className="text-lg font-bold text-ink-950 font-manga tracking-wide">
              创建漫画企划
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
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-5 text-xs bg-paper-50">
          {/* Quick templates */}
          <div>
            <div className="font-bold text-ink-950 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-vermilion-600" />
              快速填入经典日漫叙事范例：
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 text-left border border-ink-300 bg-white hover:border-ink-950 hover:bg-paper-100 transition-colors"
                >
                  <div className="font-bold text-ink-950">{tmpl.title}</div>
                  <div className="text-[11px] text-ink-500 mt-0.5">{tmpl.genre}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-ink-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-ink-950 mb-1">作品名称 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：雨夜电车站的偶遇"
                  className="w-full px-3 py-2 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">当前章节名</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="第一话：未寄之信"
                  className="w-full px-3 py-2 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-ink-950 mb-1">
                场景信息、时代背景和必要设定
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="例如：现代高架电车站，深夜暴雨，昏暗白炽灯..."
                className="w-full px-3 py-2 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 text-xs"
              />
            </div>

            {/* Character Roster */}
            <div className="space-y-2 bg-white p-3 border border-ink-950">
              <div className="flex items-center justify-between font-bold text-xs text-ink-950">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-ink-700" />
                  主要出场人物及人物关系
                </span>
                <button
                  type="button"
                  onClick={handleAddCharacter}
                  className="flex items-center gap-1 text-[11px] font-bold text-vermilion-700 hover:text-vermilion-800"
                >
                  <Plus className="w-3 h-3" /> 加一位人物
                </button>
              </div>

              {characters.map((char, cIdx) => (
                <div key={char.id || cIdx} className="flex gap-2 items-center bg-paper-50 p-2 border border-ink-200">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => {
                      const updated = [...characters];
                      updated[cIdx] = { ...char, name: e.target.value };
                      setCharacters(updated);
                    }}
                    placeholder="人物姓名"
                    className="w-24 px-2 py-1 bg-white border border-ink-300 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={char.visualTraits}
                    onChange={(e) => {
                      const updated = [...characters];
                      updated[cIdx] = { ...char, visualTraits: e.target.value };
                      setCharacters(updated);
                    }}
                    placeholder="外貌服装特征"
                    className="flex-1 px-2 py-1 bg-white border border-ink-300 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={char.relation}
                    onChange={(e) => {
                      const updated = [...characters];
                      updated[cIdx] = { ...char, relation: e.target.value };
                      setCharacters(updated);
                    }}
                    placeholder="人物关系"
                    className="w-36 px-2 py-1 bg-white border border-ink-300 text-xs focus:outline-none"
                  />
                  {characters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCharacter(cIdx)}
                      className="p-1 text-ink-400 hover:text-rose-600"
                      title="移除角色"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block font-bold text-ink-950 mb-1">
                故事简介 / 剧情详细正文 * (支持长文本输入)
              </label>
              <textarea
                required
                rows={5}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="直接输入或粘贴您的故事剧情、对话脚本或核心戏剧冲突。长文本输入时，分镜系统将先行拆解因果事件链，再转化为可视漫画格..."
                className="w-full p-3 bg-white border border-ink-950 focus:outline-none focus:ring-2 focus:ring-vermilion-500 text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <div>
                <label className="block font-bold text-ink-950 mb-1">漫画格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as MangaFormat)}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="manga_page">日式分页 (右至左 ◄)</option>
                  <option value="webtoon">纵向条漫 (从上至下 ▼)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">叙事节奏</label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as NarrativePacing)}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="slow">舒缓留白</option>
                  <option value="normal">常规叙事</option>
                  <option value="fast">紧凑激昂</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">视觉风格</label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                >
                  <option value="bw_sketch">黑白草稿分镜</option>
                  <option value="color_concept">彩色分镜示意</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-950 mb-1">作品类型</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="悬疑、动作、恋爱..."
                  className="w-full px-2 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-ink-950 mb-1">目标总页数</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={targetPages}
                  onChange={(e) => setTargetPages(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-ink-950 mb-1">每页期望画格数</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={targetPanelsPerPage}
                  onChange={(e) => setTargetPanelsPerPage(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-1.5 bg-white border border-ink-950 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-ink-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-ink-300 hover:bg-ink-100 text-ink-700 text-xs font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-1.5 bg-ink-950 text-paper-50 font-bold text-xs hover:bg-vermilion-700 transition-colors shadow-manga"
            >
              <Plus className="w-3.5 h-3.5" />
              创建并开启分镜工作台
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
