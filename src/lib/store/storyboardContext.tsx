"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  Project,
  StoryboardPage,
  StoryboardPanel,
  StoryAnalysis,
  TextElement,
  ApiConfig,
  LayoutTemplate,
} from "@/types/storyboard";
import { DEMO_PROJECTS } from "@/data/demoProjects";
import {
  updatePanelInProject,
  addPanelToPage,
  deletePanelFromPage,
  addPageToProject,
  deletePageFromProject,
  addTextElementToPanel,
  deleteTextElementFromPanel,
  generateMarkdown,
  validateProjectJson,
} from "./projectOperations";

const STORAGE_KEY_PROJECTS = "mangaflow_projects_v1";
const STORAGE_KEY_ACTIVE_ID = "mangaflow_active_project_id_v1";
const STORAGE_KEY_CONFIG = "mangaflow_api_config_v1";
const MAX_HISTORY = 30;

export interface StoryboardContextType {
  projects: Project[];
  activeProject: Project;
  activePage: StoryboardPage | null;
  selectedPanel: StoryboardPanel | null;
  selectedPanelId: string | null;
  saveStatus: "saved" | "saving" | "unsaved";
  canUndo: boolean;
  canRedo: boolean;
  apiConfig: ApiConfig;
  zoomLevel: number;
  showFlowArrows: boolean;
  viewMode: "manga" | "webtoon";

  // Actions
  setActiveProjectId: (id: string) => void;
  setActivePageId: (id: string) => void;
  setSelectedPanelId: (id: string | null) => void;
  setZoomLevel: (zoom: number) => void;
  setShowFlowArrows: (show: boolean) => void;
  setViewMode: (mode: "manga" | "webtoon") => void;

  createNewProject: (params: {
    title: string;
    synopsis: string;
    chapterTitle?: string;
    genre?: string;
    format?: "manga_page" | "webtoon";
    targetPages?: number;
    targetPanelsPerPage?: number;
    pace?: "slow" | "normal" | "fast";
    setting?: string;
    visualStyle?: "bw_sketch" | "color_concept";
    characters?: Array<{
      id: string;
      name: string;
      role: "protagonist" | "antagonist" | "supporting" | "passerby";
      visualTraits: string;
      relation: string;
    }>;
  }) => string;
  deleteProject: (id: string) => void;
  updateProjectMeta: (updates: Partial<Project>) => void;

  updatePanel: (panelId: string, updates: Partial<StoryboardPanel>) => void;
  addPanel: (pageId: string, afterPanelId?: string) => void;
  deletePanel: (pageId: string, panelId: string) => void;
  movePanel: (pageId: string, panelId: string, direction: "up" | "down") => void;
  applyAlternativeShot: (panelId: string, altIndex: number) => void;
  regeneratePage: (pageId: string, instruction?: string) => Promise<{ success: boolean; error?: string }>;

  addTextElement: (panelId: string, element?: Partial<TextElement>) => void;
  updateTextElement: (panelId: string, textId: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (panelId: string, textId: string) => void;

  addPage: () => void;
  deletePage: (pageId: string) => void;
  updatePageMeta: (pageId: string, updates: Partial<StoryboardPage>) => void;
  changePageLayout: (pageId: string, layout: LayoutTemplate) => void;

  setStoryAnalysis: (analysis: StoryAnalysis) => void;
  setStoryboardPages: (pages: StoryboardPage[]) => void;
  updateApiConfig: (config: Partial<ApiConfig>) => void;

  undo: () => void;
  redo: () => void;

  exportMarkdown: () => string;
  exportJson: () => string;
  importJson: (jsonStr: string) => { success: boolean; error?: string };
  resetToDemo: () => void;
}

const StoryboardContext = createContext<StoryboardContextType | null>(null);

export function StoryboardProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [activeProjectId, setActiveProjectIdState] = useState<string>(DEMO_PROJECTS[0].id);
  const [activePageId, setActivePageIdState] = useState<string>("");
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showFlowArrows, setShowFlowArrows] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"manga" | "webtoon">("manga");

  const [apiConfig, setApiConfigState] = useState<ApiConfig>({
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o-mini",
    isCustomConfigured: false,
  });

  // History stacks for Undo / Redo
  const undoStackRef = useRef<Project[][]>([]);
  const redoStackRef = useRef<Project[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Load from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);

      if (savedProjects) {
        const parsed = JSON.parse(savedProjects) as Project[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          if (savedActiveId && parsed.some((p) => p.id === savedActiveId)) {
            setActiveProjectIdState(savedActiveId);
          } else {
            setActiveProjectIdState(parsed[0].id);
          }
        }
      }

      if (savedConfig) {
        const parsedCfg = JSON.parse(savedConfig) as ApiConfig;
        if (parsedCfg) {
          setApiConfigState(parsedCfg);
        }
      }
    } catch (e) {
      console.error("Failed to restore from local storage:", e);
    }
  }, []);

  // Sync to localStorage whenever projects change
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProjectId);
        setSaveStatus("saved");
      } catch (e) {
        console.error("Local storage save error:", e);
        setSaveStatus("unsaved");
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [projects, activeProjectId]);

  // Active Project computation
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || DEMO_PROJECTS[0];

  // Set default activePageId if empty or invalid
  useEffect(() => {
    if (!activeProject.pages || activeProject.pages.length === 0) {
      setActivePageIdState("");
      setSelectedPanelId(null);
      return;
    }
    if (!activePageId || !activeProject.pages.some((p) => p.pageId === activePageId)) {
      const firstPage = activeProject.pages[0];
      setActivePageIdState(firstPage.pageId);
      if (firstPage.panels.length > 0 && !selectedPanelId) {
        setSelectedPanelId(firstPage.panels[0].panelId);
      }
    }
  }, [activeProject, activePageId, selectedPanelId]);

  const activePage = activeProject?.pages?.find((p) => p.pageId === activePageId) || activeProject?.pages?.[0] || null;

  // Selected Panel computation
  const selectedPanel =
    activePage?.panels?.find((p) => p.panelId === selectedPanelId) ||
    activePage?.panels?.[0] ||
    null;

  // Push history snapshot before mutating
  const pushHistorySnapshot = useCallback(() => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(projects)));
    if (undoStackRef.current.length > MAX_HISTORY) {
      undoStackRef.current.shift();
    }
    // Any new change clears the redo stack
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [projects]);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(projects)));
    setProjects(previous);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [projects]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(projects)));
    setProjects(next);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, [projects]);

  const setActiveProjectId = useCallback((id: string) => {
    setActiveProjectIdState(id);
    setSelectedPanelId(null);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } catch {}
  }, []);

  const setActivePageId = useCallback((id: string) => {
    setActivePageIdState(id);
    const targetProject = projects.find((p) => p.id === activeProjectId);
    const targetPage = targetProject?.pages?.find((p) => p.pageId === id);
    if (targetPage && targetPage.panels.length > 0) {
      setSelectedPanelId(targetPage.panels[0].panelId);
    } else {
      setSelectedPanelId(null);
    }
  }, [projects, activeProjectId]);

  const updateApiConfig = useCallback((updates: Partial<ApiConfig>) => {
    setApiConfigState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const updateProjectMeta = useCallback(
    (updates: Partial<Project>) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id === activeProjectId) {
            return {
              ...proj,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const createNewProject = useCallback(
    (params: {
      title: string;
      synopsis: string;
      chapterTitle?: string;
      genre?: string;
      format?: "manga_page" | "webtoon";
      targetPages?: number;
      targetPanelsPerPage?: number;
      pace?: "slow" | "normal" | "fast";
      setting?: string;
      visualStyle?: "bw_sketch" | "color_concept";
      characters?: Array<{
        id: string;
        name: string;
        role: "protagonist" | "antagonist" | "supporting" | "passerby";
        visualTraits: string;
        relation: string;
      }>;
    }) => {
      pushHistorySnapshot();
      const newId = `project-${Date.now()}`;
      const defaultPageId = `page-${Date.now()}-1`;
      const defaultPanelId = `panel-${defaultPageId}-1`;

      const initialCharacters =
        params.characters && params.characters.length > 0
          ? params.characters
          : [
              {
                id: `char-1`,
                name: "主角",
                role: "protagonist" as const,
                visualTraits: "年轻少年，眼神清澈，身穿常服",
                relation: "核心主角",
              },
            ];

      const newProject: Project = {
        id: newId,
        title: params.title || "新建漫画企划",
        chapterTitle: params.chapterTitle || "第一话：序章",
        synopsis: params.synopsis || "在这里输入故事大纲或剧情...",
        characters: initialCharacters,
        setting: params.setting || "现代都市或架空世界",
        genre: params.genre || "剧情",
        format: params.format || "manga_page",
        targetPages: params.targetPages || 2,
        targetPanelsPerPage: params.targetPanelsPerPage || 4,
        pace: params.pace || "normal",
        visualStyle: params.visualStyle || "bw_sketch",
        analysis: null,
        pages: [
          {
            pageId: defaultPageId,
            pageNumber: 1,
            sceneName: "序幕开篇",
            purpose: "确立故事主角与世界观开场",
            readingOrder: params.format === "webtoon" ? "ttb" : "rtl",
            layoutTemplate: "focus_top",
            visualFocalPoint: "顶部开幕大画格",
            pageTurnSuspense: "埋设初始疑问引导翻页",
            panels: [
              {
                panelId: defaultPanelId,
                panelNumber: 1,
                narrationPurpose: "环境交代与人物亮相",
                shotSize: "extreme_wide",
                cameraAngle: "eye_level",
                composition: {
                  type: "rule_of_thirds",
                  description: "广阔全景建立镜头",
                  focalPoint: "中央人物剪影",
                },
                characterPositions: [
                  {
                    name: "主角",
                    position: "center",
                    depth: "foreground",
                    facing: "front",
                    posture: "静立注视前方",
                  },
                ],
                action: "站在场景中央，微风吹动衣襟",
                expression: "沉稳专注",
                background: "空旷的环境线条与远景轮廓",
                lightingAndMood: "清冷晨光，黑白线条清晰",
                visualDescription: "开场大远景，主角站在视野宽阔的地平线前，奠定故事基调。",
                textElements: [
                  {
                    id: `txt-${Date.now()}-1`,
                    speaker: "旁白",
                    content: "故事，从这一刻悄然拉开序幕。",
                    type: "narration",
                    suggestedStyle: "经典横幅旁白条",
                    suggestedPosition: "top_right",
                    readingPriority: 1,
                    reason: "开门见山引入世界观",
                  },
                ],
                transition: "自然推入下一格中景",
                drawingNotes: "保持画面空气透视与留白",
                teachingNote: {
                  whyThisShot: "采用【大远景】交代环境与宏大格局，确立故事坐标。",
                  readerFocus: "引导读者从宏观环境渐渐聚焦至画面正中的人物。",
                  emotionAndPacing: "舒缓而平稳的开场定格。",
                  panelTransitionLogic: "作为定场格连接后续人物细节刻画。",
                  textVisualBalance: "旁白简明，留给画面最大的呼吸空间。",
                  alternativeShots: [
                    {
                      title: "方案 A：主角面部特写开场（倒叙流）",
                      shotSize: "close_up",
                      cameraAngle: "eye_level",
                      composition: "中心对称面部特写",
                      pros: "第一秒直接抓住人物情绪",
                      cons: "缺少环境交代，需后文补充",
                      visualDescription: "主角专注的双眸特写。",
                      drawingNotes: "精细刻画眼神光。",
                    },
                    {
                      title: "方案 B：关键道具近景开场（悬念流）",
                      shotSize: "detail",
                      cameraAngle: "low_angle",
                      composition: "前景放置关键信物",
                      pros: "悬疑感充足",
                      cons: "人物登场稍显滞后",
                      visualDescription: "放在桌面的神秘物品特写。",
                      drawingNotes: "强调道具反光质感。",
                    },
                  ],
                },
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectIdState(newId);
      setActivePageIdState(defaultPageId);
      setSelectedPanelId(defaultPanelId);
      return newId;
    },
    [pushHistorySnapshot]
  );

  const deleteProject = useCallback(
    (id: string) => {
      if (projects.length <= 1) {
        alert("至少需要保留一个项目。");
        return;
      }
      pushHistorySnapshot();
      setProjects((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        if (activeProjectId === id) {
          const nextActive = filtered[0];
          setActiveProjectIdState(nextActive.id);
        }
        return filtered;
      });
    },
    [projects.length, pushHistorySnapshot, activeProjectId]
  );

  const updatePanel = useCallback(
    (panelId: string, updates: Partial<StoryboardPanel>) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => (proj.id === activeProjectId ? updatePanelInProject(proj, panelId, updates) : proj))
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const addPanel = useCallback(
    (pageId: string, afterPanelId?: string) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => (proj.id === activeProjectId ? addPanelToPage(proj, pageId, afterPanelId) : proj))
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const deletePanel = useCallback(
    (pageId: string, panelId: string) => {
      const currentProj = projects.find((p) => p.id === activeProjectId);
      const targetPage = currentProj?.pages.find((pg) => pg.pageId === pageId);
      if (targetPage && targetPage.panels.length <= 1) {
        alert("每页至少需要保留一个漫画格。");
        return;
      }
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return deletePanelFromPage(proj, pageId, panelId).updatedProject;
        })
      );
      if (selectedPanelId === panelId) {
        setSelectedPanelId(null);
      }
    },
    [activeProjectId, projects, selectedPanelId, pushHistorySnapshot]
  );

  const movePanel = useCallback(
    (pageId: string, panelId: string, direction: "up" | "down") => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            pages: proj.pages.map((pg) => {
              if (pg.pageId !== pageId) return pg;
              const idx = pg.panels.findIndex((p) => p.panelId === panelId);
              if (idx === -1) return pg;
              const targetIdx = direction === "up" ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= pg.panels.length) return pg;

              const reordered = [...pg.panels];
              const [moved] = reordered.splice(idx, 1);
              reordered.splice(targetIdx, 0, moved);

              const reindexed = reordered.map((p, i) => ({ ...p, panelNumber: i + 1 }));
              return { ...pg, panels: reindexed };
            }),
          };
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const applyAlternativeShot = useCallback(
    (panelId: string, altIndex: number) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            pages: proj.pages.map((pg) => {
              const panelIdx = pg.panels.findIndex((p) => p.panelId === panelId);
              if (panelIdx === -1) return pg;
              const currentPanel = pg.panels[panelIdx];
              const chosenAlt = currentPanel.teachingNote.alternativeShots[altIndex];
              if (!chosenAlt) return pg;

              const updated: StoryboardPanel = {
                ...currentPanel,
                shotSize: chosenAlt.shotSize,
                cameraAngle: chosenAlt.cameraAngle,
                composition: {
                  ...currentPanel.composition,
                  description: chosenAlt.composition,
                },
                visualDescription: chosenAlt.visualDescription,
                drawingNotes: chosenAlt.drawingNotes,
                narrationPurpose: `采用【${chosenAlt.title}】：${chosenAlt.pros}`,
                teachingNote: {
                  ...currentPanel.teachingNote,
                  whyThisShot: `经导演重构采用【${chosenAlt.title}】（${chosenAlt.shotSize} / ${chosenAlt.cameraAngle}）。核心优势：${chosenAlt.pros}。`,
                },
              };

              const newPanels = [...pg.panels];
              newPanels[panelIdx] = updated;
              return { ...pg, panels: newPanels };
            }),
          };
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const regeneratePage = useCallback(
    async (pageId: string, instruction?: string) => {
      const pageToRegen = activeProject.pages.find((p) => p.pageId === pageId);
      if (!pageToRegen) return { success: false, error: "未找到该页面" };

      try {
        const res = await fetch("/api/ai/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: activeProject,
            pageId,
            pageNumber: pageToRegen.pageNumber,
            instruction,
            apiConfig: apiConfig.isCustomConfigured ? apiConfig : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "单页重构失败");
        }

        pushHistorySnapshot();
        setProjects((prev) =>
          prev.map((proj) => {
            if (proj.id !== activeProjectId) return proj;
            const updatedPages = proj.pages.map((p) => (p.pageId === pageId ? data.page : p));
            return {
              ...proj,
              pages: updatedPages,
              updatedAt: new Date().toISOString(),
            };
          })
        );

        if (data.page?.panels?.length > 0) {
          setSelectedPanelId(data.page.panels[0].panelId);
        }

        return { success: true };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "重构失败";
        return { success: false, error: errorMsg };
      }
    },
    [activeProject, activeProjectId, apiConfig, pushHistorySnapshot]
  );

  const addTextElement = useCallback(
    (panelId: string, element?: Partial<TextElement>) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => (proj.id === activeProjectId ? addTextElementToPanel(proj, panelId, element) : proj))
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const updateTextElement = useCallback(
    (panelId: string, textId: string, updates: Partial<TextElement>) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            pages: proj.pages.map((pg) => {
              const panelIdx = pg.panels.findIndex((p) => p.panelId === panelId);
              if (panelIdx === -1) return pg;
              const panel = pg.panels[panelIdx];
              const updatedElements = (panel.textElements || []).map((txt) => {
                if (txt.id === textId) {
                  return { ...txt, ...updates };
                }
                return txt;
              });
              const newPanels = [...pg.panels];
              newPanels[panelIdx] = { ...panel, textElements: updatedElements };
              return { ...pg, panels: newPanels };
            }),
          };
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const deleteTextElement = useCallback(
    (panelId: string, textId: string) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => (proj.id === activeProjectId ? deleteTextElementFromPanel(proj, panelId, textId) : proj))
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const addPage = useCallback(() => {
    pushHistorySnapshot();
    setProjects((prev) =>
      prev.map((proj) => (proj.id === activeProjectId ? addPageToProject(proj) : proj))
    );
  }, [activeProjectId, pushHistorySnapshot]);

  const deletePage = useCallback(
    (pageId: string) => {
      if (activeProject.pages.length <= 1) {
        alert("至少需要保留一页漫画分镜。");
        return;
      }
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return deletePageFromProject(proj, pageId).updatedProject;
        })
      );
      if (activePageId === pageId) {
        const remaining = activeProject.pages.filter((p) => p.pageId !== pageId);
        if (remaining.length > 0) {
          setActivePageIdState(remaining[0].pageId);
        }
      }
    },
    [activeProjectId, activePageId, activeProject.pages, pushHistorySnapshot]
  );

  const updatePageMeta = useCallback(
    (pageId: string, updates: Partial<StoryboardPage>) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            pages: proj.pages.map((pg) => {
              if (pg.pageId === pageId) {
                return { ...pg, ...updates };
              }
              return pg;
            }),
          };
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const changePageLayout = useCallback(
    (pageId: string, layout: LayoutTemplate) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== activeProjectId) return proj;
          return {
            ...proj,
            updatedAt: new Date().toISOString(),
            pages: proj.pages.map((pg) => {
              if (pg.pageId === pageId) {
                return { ...pg, layoutTemplate: layout };
              }
              return pg;
            }),
          };
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const setStoryAnalysis = useCallback(
    (analysis: StoryAnalysis) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id === activeProjectId) {
            return {
              ...proj,
              analysis,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        })
      );
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const setStoryboardPages = useCallback(
    (pages: StoryboardPage[]) => {
      pushHistorySnapshot();
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id === activeProjectId) {
            return {
              ...proj,
              pages,
              updatedAt: new Date().toISOString(),
            };
          }
          return proj;
        })
      );
      if (pages.length > 0) {
        setActivePageIdState(pages[0].pageId);
        if (pages[0].panels.length > 0) {
          setSelectedPanelId(pages[0].panels[0].panelId);
        }
      }
    },
    [activeProjectId, pushHistorySnapshot]
  );

  const exportMarkdown = useCallback(() => {
    return generateMarkdown(activeProject);
  }, [activeProject]);

  const exportJson = useCallback(() => {
    return JSON.stringify(activeProject, null, 2);
  }, [activeProject]);

  const importJson = useCallback(
    (jsonStr: string) => {
      const validation = validateProjectJson(jsonStr);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }
      const parsed = validation.project;
      pushHistorySnapshot();
      setProjects((prev) => [parsed, ...prev.filter((p) => p.id !== parsed.id)]);
      setActiveProjectIdState(parsed.id);
      if (parsed.pages.length > 0) {
        setActivePageIdState(parsed.pages[0].pageId);
        if (parsed.pages[0].panels.length > 0) {
          setSelectedPanelId(parsed.pages[0].panels[0].panelId);
        }
      }
      return { success: true };
    },
    [pushHistorySnapshot]
  );

  const resetToDemo = useCallback(() => {
    pushHistorySnapshot();
    setProjects(DEMO_PROJECTS);
    setActiveProjectIdState(DEMO_PROJECTS[0].id);
    setActivePageIdState(DEMO_PROJECTS[0].pages[0].pageId);
    setSelectedPanelId(DEMO_PROJECTS[0].pages[0].panels[0].panelId);
  }, [pushHistorySnapshot]);

  return (
    <StoryboardContext.Provider
      value={{
        projects,
        activeProject,
        activePage,
        selectedPanel,
        selectedPanelId,
        saveStatus,
        canUndo,
        canRedo,
        apiConfig,
        zoomLevel,
        showFlowArrows,
        viewMode,

        setActiveProjectId,
        setActivePageId,
        setSelectedPanelId,
        setZoomLevel,
        setShowFlowArrows,
        setViewMode,

        createNewProject,
        deleteProject,
        updateProjectMeta,

        updatePanel,
        addPanel,
        deletePanel,
        movePanel,
        applyAlternativeShot,
        regeneratePage,

        addTextElement,
        updateTextElement,
        deleteTextElement,

        addPage,
        deletePage,
        updatePageMeta,
        changePageLayout,

        setStoryAnalysis,
        setStoryboardPages,
        updateApiConfig,

        undo,
        redo,

        exportMarkdown,
        exportJson,
        importJson,
        resetToDemo,
      }}
    >
      {children}
    </StoryboardContext.Provider>
  );
}

export function useStoryboard() {
  const context = useContext(StoryboardContext);
  if (!context) {
    throw new Error("useStoryboard must be used within a StoryboardProvider");
  }
  return context;
}
