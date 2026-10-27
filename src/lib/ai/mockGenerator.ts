import {
  Project,
  StoryAnalysis,
  StoryboardPage,
  StoryboardPanel,
  AlternativeShot,
  ShotSize,
  CameraAngle,
  LayoutTemplate,
} from "@/types/storyboard";

/**
 * Intelligent rule-based storyboard generator for Demo Mode.
 * Creates contextually aware, high-quality manga storyboard structures
 * without external network or API keys.
 */

export function generateMockAnalysis(project: Project): StoryAnalysis {
  const pName = project.characters[0]?.name || "主角";
  const rivalName = project.characters[1]?.name || "关键人物";
  const title = project.title || "未命名故事";
  const setting = project.setting || "未知舞台";
  const genre = project.genre || "剧情";

  // Check if text is long or has multiple paragraphs
  const rawSynopsis = project.synopsis || "";
  const paragraphs = rawSynopsis
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let events: string[] = [];
  if (paragraphs.length >= 3) {
    // Multi-paragraph segmented analysis to prevent compressing later half
    events = paragraphs.map((para, idx) => {
      const summary = para.length > 50 ? `${para.slice(0, 48)}...` : para;
      return `【分段${idx + 1}】${summary}`;
    });
  } else {
    events = [
      `${pName}独自处于${setting}，怀揣着未解的心事与关键物品，环境氛围极其压抑。`,
      `远处突然传来动静打破沉寂，${rivalName}带着急促的意图突入现场。`,
      `两人目光猝不及防交汇，此前隐藏的冲突与秘密初露端倪。`,
      `${rivalName}直接挑明了最致命的关键疑问，促使${pName}的心理防线出现破绽。`,
      `突发外部环境变化（声音/光影/时间临近），迫使两人在瞬间作出截然不同的行动抉择。`,
    ];
  }

  return {
    events,
    sceneBreaks: [
      {
        sceneId: `scene-${Date.now()}-1`,
        heading: `场景一：${setting}的寂静前奏`,
        purpose: "通过大景别与环境光影交代空间孤独感，建立主角行动前的心理重压",
        timeAndSetting: `${setting} / 关键时刻`,
      },
      {
        sceneId: `scene-${Date.now()}-2`,
        heading: `场景二：突入与视线交锋`,
        purpose: "打破静态平衡，利用动作突进与对角线构图提升戏剧张力",
        timeAndSetting: `${setting} / 危机骤临`,
      },
    ],
    characterArcs: [
      {
        characterName: pName,
        emotionShift: "从被动防备与压抑 -> 骤然被揭穿时的动荡 -> 坚定抉择",
        keyAction: "抓紧身边的关键道具，身体从蜷缩防御转为挺身面对",
      },
      {
        characterName: rivalName,
        emotionShift: "焦急逼近 -> 锐利审视 -> 吐露真实目的后的释然与催促",
        keyAction: "停下脚步，直视对方的眼睛，亮出底牌",
      },
    ],
    keyBeats: [
      {
        beatType: "foreshadowing",
        title: "关键随身物品特写",
        description: `${pName}下意识藏匿的物品一角，埋下剧情的核心悬念`,
        suggestedTreatment: "高对比度局部特写，周围环境深度虚化",
      },
      {
        beatType: "cliffhanger",
        title: "视线交错与翻页钩子",
        description: "两人第一次目光相撞时的瞬间定格，作为本页底格悬念",
        suggestedTreatment: "倾斜构图，双重眼神反打切线，雷声或巨响拟声词加持",
      },
    ],
    visualPointers: [
      `利用${setting}的独特光源（水面反光/晚霞逆光/日光灯管）切割出人物深浅明暗面`,
      "角色的肢体语言（捏紧的拳头、颤抖的发梢、微张的嘴唇）优先于长篇内心独白",
      "道具的破损与细节痕迹暗示人物经历的隐秘过往",
    ],
    textPointers: [
      "避免在画格中重复陈述画面已经展现的内容（杜绝画一个苹果旁边写'这是一个苹果'）",
      "关键台词精简在15字以内，音效词（SFX）根据力度大小调整在画框内的排版占比",
    ],
    pauseAndRevealMoments: [
      "跨页翻页前的最后一格：给出视觉冲击强烈的疑问镜头，促使读者主动翻页寻找答案",
      "真相揭晓格：采用宽格或重点大格，给予读者充分的视觉消化时间",
    ],
    narrativeAdvice: `针对【${genre}】类型的叙事节奏：建议保持前松后紧。开篇建立镜头给足环境留白，中段通过中景和脚步动势提速，高潮瞬间以极近特写定格。注意日式分镜自右向左的视线流向，确保人物视线与对白气泡形成顺畅的倒S形浏览路径。`,
  };
}

export function generateMockPages(project: Project, analysis?: StoryAnalysis | null): StoryboardPage[] {
  const pageCount = Math.max(1, Math.min(project.targetPages || 2, 4));
  const pages: StoryboardPage[] = [];

  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    pages.push(generateMockSinglePage(project, pageIdx + 1, analysis));
  }

  return pages;
}

export function generateMockSinglePage(
  project: Project,
  pageNumber: number,
  analysis?: StoryAnalysis | null,
  instruction?: string
): StoryboardPage {
  const pName = project.characters[0]?.name || "主角";
  const rivalName = project.characters[1]?.name || "神秘来客";
  const panelsPerPage = Math.max(3, Math.min(project.targetPanelsPerPage || 4, 5));

  const shotSequence: ShotSize[] = ["extreme_wide", "medium", "detail", "extreme_close_up", "close_up"];
  const angleSequence: CameraAngle[] = ["high_angle", "eye_level", "low_angle", "dutch_angle", "eye_level"];
  const layoutTemplates: LayoutTemplate[] = ["focus_top", "dynamic_action", "split_horizontal", "grid_4"];

  const pageId = `page-${Date.now()}-${pageNumber}`;
  const panels: StoryboardPanel[] = [];
  const isFirstPage = pageNumber === 1;

  for (let panelIdx = 0; panelIdx < panelsPerPage; panelIdx++) {
    const panelNum = panelIdx + 1;
    const shotSize = shotSequence[panelIdx % shotSequence.length];
    const cameraAngle = angleSequence[panelIdx % angleSequence.length];
    const isLastPanel = panelNum === panelsPerPage;
    const panelId = `panel-${pageId}-${panelNum}`;

    panels.push({
      panelId,
      panelNumber: panelNum,
      narrationPurpose: isLastPanel
        ? `第${pageNumber}页翻页高潮：制造视线碰撞与核心悬念，引导读者翻向下一页`
        : `推进场景情境，由${shotSize === "extreme_wide" ? "宏观环境进入人物私密状态" : "动作冲突加剧情绪张力"}`,
      shotSize,
      cameraAngle,
      composition: {
        type: panelNum === 1 ? "rule_of_thirds" : isLastPanel ? "diagonal" : "central",
        description: isLastPanel
          ? "斜切构图，两人视线在对角线中央激烈碰撞"
          : "经典三分法布局，人物位于黄金分割线，背景留出戏剧张力空间",
        focalPoint: isLastPanel ? "两人震颤的瞳孔与手中的关键道具" : `${pName}神色微变的面容`,
      },
      characterPositions: [
        {
          name: pName,
          position: panelNum % 2 === 0 ? "right" : "center",
          depth: "foreground",
          facing: panelNum % 2 === 0 ? "left" : "front",
          posture: isLastPanel ? "身体微倾向后防备，右手按在暗袋处" : "低头沉思，双肩紧绷",
        },
        ...(panelNum >= 2
          ? [
              {
                name: rivalName,
                position: "left" as const,
                depth: "midground" as const,
                facing: "right" as const,
                posture: "大步逼近，目光如炬，手中的物品若隐若现",
              },
            ]
          : []),
      ],
      action: isLastPanel
        ? `狂风掠过，${rivalName}猛然停步，${pName}惊觉抬头，四目相对！`
        : panelNum === 1
        ? `${pName}独自站在阴影中，指尖不自觉地摩挲着怀里的物件`
        : `${rivalName}的身影突然穿过光影屏障，脚步声由远及近骤然逼近`,
      expression: isLastPanel
        ? `${pName}：瞳孔骤缩的愕然；${rivalName}：锋芒毕露的逼视`
        : "面容沉静而隐藏着不易察觉的忧虑",
      background: project.setting || "空旷而充满故事细节的舞台环境",
      lightingAndMood: isLastPanel
        ? "一道电光或逆向强光切过画面，黑白高反差，戏剧张力达到顶峰"
        : "顶光投下深重阴影，冷色调素描质感，空气充满凝滞感",
      visualDescription: isLastPanel
        ? `【翻页钩子格】镜头倾斜。左上方是${rivalName}疾冲后刹停的凌厉视线，右下方是${pName}仓促回眸的半张脸。两人中间留出强烈的动势切线。背景彻底虚化涂黑，突出宿命般的对决感。`
        : `【${shotSize}】平稳推进。${pName}在画面主体位置，环境线条向纵深延伸，光影将人物轮廓勾勒得极其清晰，为绘制者提供丰富的细节表现空间。`,
      textElements: isLastPanel
        ? [
            {
              id: `txt-${panelId}-1`,
              speaker: pName,
              content: `你……怎么会在这里？！`,
              type: "whisper",
              suggestedStyle: "微颤抖波浪细线气泡",
              suggestedPosition: "bottom_right",
              readingPriority: 1,
              reason: "突遭撞破后的压低声音惊呼，凸显做贼心虚与心理震颤",
            },
            {
              id: `txt-${panelId}-2`,
              speaker: "突发声",
              content: "呼轰——！",
              type: "sfx",
              suggestedStyle: "粗粝刚劲裂纹拟声字，横向切破画框",
              suggestedPosition: "top_left",
              readingPriority: 2,
              reason: "外部环境声与人物震惊内心共鸣，强化翻页前的听觉留白",
            },
          ]
        : [
            {
              id: `txt-${panelId}-1`,
              speaker: panelNum === 1 ? "旁白" : pName,
              content:
                panelNum === 1
                  ? `距离倒计时的终点，只剩最后的片刻。`
                  : `（如果在这里被发现，一切就都前功尽弃了……）`,
              type: panelNum === 1 ? "narration" : "innerMonologue",
              suggestedStyle: panelNum === 1 ? "黑色实线无边框条" : "圆角微倾斜虚线框",
              suggestedPosition: "top_right",
              readingPriority: 1,
              reason: "简明交代心理重压与时限，绝不啰嗦",
            },
          ],
      transition: isLastPanel ? "停留在最高戏剧悬念点，促使读者翻页" : "顺应视线流向，自然引导至下一格",
      drawingNotes: isLastPanel
        ? "注意两人的视线轴（180度轴线规则），不要在同一个空间内出现左右对调穿帮；眼神高光要锐利。"
        : "排线保持日式黑白漫画网点质感，注意阴影面的纯黑涂白留白对比。",
      teachingNote: {
        whyThisShot: isLastPanel
          ? "采用【倾斜面部特写】（Dutch Angle Extreme Close-Up）。在每一页的最末画格（翻页前），必须打破前格的稳定构图。倾斜构图天生带有'不平衡'与'危机'的心理暗示，能瞬间将读者的求知欲推向顶点。"
          : `采用【${shotSize}】。作为本页的叙事铺垫段落，适度的景别有助于读者理清角色所处的空间相对位置，避免一上来就全是特写导致'幽闭空间迷失'。`,
        readerFocus: isLastPanel
          ? "第一眼被左上与右下的对角线视线碰撞吸引，随后落在关键的惊呼气泡上。"
          : "读者视线顺着环境纵深线自然聚焦在主角脸部的微表情。",
        emotionAndPacing: isLastPanel
          ? "节奏在瞬间刹停，心跳骤然漏跳半拍。给读者制造'必须要翻过去看发生什么'的生理驱动。"
          : "舒缓但充满暗流，有条不紊地向前推进。",
        panelTransitionLogic: isLastPanel
          ? "作为本页的悬念句点，连接下一页的大画格揭示。"
          : "与上一格形成景别阶梯，由大到小递进，层次分明。",
        textVisualBalance:
          "文字极度克制，把表现空间全权交付给人物神态与镜头构图，坚决杜绝'全知全能念说明文'式的分镜坏习惯。",
        alternativeShots: [
          {
            title: "备选方案 A：双人过肩正反打中景（空间稳妥型）",
            shotSize: "medium",
            cameraAngle: "over_the_shoulder",
            composition: "越过主角肩膀看向逼近的对手",
            pros: "空间关系一目了然，展现两人身体间距",
            cons: "情绪紧迫感有所削弱，不如特写更具压迫力",
            visualDescription: `从${pName}背后低角度拍摄，对手站在五步开外正中位置。`,
            drawingNotes: "前景肩膀需适当涂黑作为阴影框。",
          },
          {
            title: "备选方案 B：纯局部道具与双脚刹停特写（悬疑隐喻型）",
            shotSize: "detail",
            cameraAngle: "low_angle",
            composition: "地面水渍中倒映出两人的双足与滑落的物件",
            pros: "极富意境与冷峻的悬疑感，留白充沛",
            cons: "缺少直观的面部五官表情冲击，对作画水平要求极高",
            visualDescription: "镜头紧贴地面，脚步急速刹停溅起一圈涟漪，反光中隐现二人身影。",
            drawingNotes: "倒影透视与水波纹路需要精细绘制。",
          },
        ],
      },
    });
  }

  const layoutTemplatesMap: LayoutTemplate[] = ["focus_top", "dynamic_action", "split_horizontal", "grid_4"];
  const chosenLayout = layoutTemplatesMap[(pageNumber - 1) % layoutTemplatesMap.length];

  return {
    pageId,
    pageNumber,
    sceneName: `${project.title || "漫画分镜"} - 第${pageNumber}页${instruction ? `（${instruction}）` : ""}`,
    purpose: isFirstPage ? "建立人物动机，引入突发危机并留下翻页悬念" : "危机升级与正面交锋，揭示关键真相",
    readingOrder: project.format === "webtoon" ? "ttb" : "rtl",
    layoutTemplate: chosenLayout,
    visualFocalPoint: isFirstPage ? "右上角开篇大景别与左下角翻页惊愕特写" : "中间横幅大画格的真相揭晓",
    pageTurnSuspense: isFirstPage ? "两人在暴风雨/暗影中突然四目对峙，秘密即将曝光" : "外部变量突临，迎来下一话的全新变局",
    panels,
  };
}

export function regenerateMockPanel(panel: StoryboardPanel, instruction: string): StoryboardPanel {
  // Synthesize an improved panel incorporating user's direction
  const isCloseUp = instruction.includes("特写") || instruction.includes("表情") || instruction.includes("眼神");
  const isWide = instruction.includes("远景") || instruction.includes("全景") || instruction.includes("环境");
  const isAction = instruction.includes("动作") || instruction.includes("动态") || instruction.includes("打斗");

  const newShotSize: ShotSize = isCloseUp ? "extreme_close_up" : isWide ? "wide" : isAction ? "medium" : panel.shotSize;
  const newAngle: CameraAngle = isAction ? "low_angle" : isCloseUp ? "dutch_angle" : panel.cameraAngle;

  return {
    ...panel,
    shotSize: newShotSize,
    cameraAngle: newAngle,
    narrationPurpose: `根据调整意图【${instruction}】：重新强化画面的视觉张力与信息聚焦`,
    visualDescription: `【优化后画面】根据指令“${instruction}”调整：镜头机位调整为${newShotSize}与${newAngle}。画面强化了核心人物的肢体张力与光影高反差。背景适当削减干扰元素，使读者的第一视觉落点牢牢锁定在主体动作上。`,
    action: `角色顺应指令【${instruction}】做出更加明确有力的戏剧动作，瞬间力量感大幅提升。`,
    expression: `神情更加鲜明，微表情细节（如眉骨压低、视线聚焦、唇齿微动）清晰可辨。`,
    drawingNotes: `绘制要点：根据调整要求“${instruction}”，强化明暗交界线线条的粗细抑扬顿挫，凸显戏剧重力。`,
    teachingNote: {
      ...panel.teachingNote,
      whyThisShot: `经导演重构：针对调整要求“${instruction}”，改用【${newShotSize}】配合【${newAngle}】。这种改动有效解决了此前可能存在的视觉重心不明确问题，使叙事目的更加锋利直白。`,
      readerFocus: `读者的视线将在第一时间被改动后的主体动作所捕获。`,
    },
  };
}
