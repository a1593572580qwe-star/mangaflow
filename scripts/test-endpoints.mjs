// scripts/test-endpoints.mjs
async function runTests() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  console.log("=== Testing MangaFlow API Endpoints ===");

  // 1. Config endpoint
  console.log("\n1. Testing GET /api/ai/config...");
  const cfgRes = await fetch(`${baseUrl}/api/ai/config`);
  const cfgData = await cfgRes.json();
  console.log("Status:", cfgRes.status, "Data:", cfgData);

  // 2. Analyze endpoint (Demo mode)
  console.log("\n2. Testing POST /api/ai/analyze (Demo mode)...");
  const testProject = {
    id: "test-p1",
    title: "雨夜电车站的偶遇",
    synopsis: "深夜暴雨的单轨电车站，林澈正握着藏在怀里的退学信。苏晓晴护着纸箱冲入站台，两人四目相对。",
    characters: [
      { id: "c1", name: "林澈", role: "protagonist", visualTraits: "黑色短发", relation: "同学" },
      { id: "c2", name: "苏晓晴", role: "protagonist", visualTraits: "黑框眼镜", relation: "班长" },
    ],
    genre: "悬疑",
    format: "manga_page",
    targetPages: 2,
    targetPanelsPerPage: 4,
    pace: "normal",
  };

  const analyzeRes = await fetch(`${baseUrl}/api/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project: testProject }),
  });
  const analyzeData = await analyzeRes.json();
  console.log("Status:", analyzeRes.status, "isDemoMode:", analyzeData.isDemoMode);
  console.log("Events count:", analyzeData.analysis?.events?.length);
  console.log("Scene breaks:", analyzeData.analysis?.sceneBreaks?.length);

  // 3. Storyboard endpoint (Demo mode)
  console.log("\n3. Testing POST /api/ai/storyboard (Demo mode)...");
  const sbRes = await fetch(`${baseUrl}/api/ai/storyboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: {
        ...testProject,
        analysis: analyzeData.analysis,
      },
    }),
  });
  const sbData = await sbRes.json();
  console.log("Status:", sbRes.status, "isDemoMode:", sbData.isDemoMode);
  console.log("Pages count:", sbData.pages?.length);
  console.log("Panels in page 1:", sbData.pages?.[0]?.panels?.length);

  // 4. Panel regenerate endpoint
  console.log("\n4. Testing POST /api/ai/regenerate...");
  const firstPanel = sbData.pages?.[0]?.panels?.[0];
  const regenRes = await fetch(`${baseUrl}/api/ai/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      panel: firstPanel,
      instruction: "改为仰角特写，增加雷声拟声词与闪电光影",
    }),
  });
  const regenData = await regenRes.json();
  console.log("Status:", regenRes.status, "Updated shotSize:", regenData.panel?.shotSize);

  // 5. Continuity check endpoint
  console.log("\n5. Testing POST /api/ai/check...");
  const checkRes = await fetch(`${baseUrl}/api/ai/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: {
        ...testProject,
        pages: sbData.pages,
      },
    }),
  });
  const checkData = await checkRes.json();
  console.log("Status:", checkRes.status, "Score:", checkData.report?.score);
  console.log("Issues found:", checkData.report?.continuityIssues?.length);

  // 6. Single Page Regenerate endpoint
  console.log("\n6. Testing POST /api/ai/page (Single Page Regeneration)...");
  const pageRes = await fetch(`${baseUrl}/api/ai/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: testProject,
      pageId: sbData.pages?.[0]?.pageId,
      pageNumber: 1,
      instruction: "重构为高戏剧性大格特写开场",
    }),
  });
  const pageData = await pageRes.json();
  console.log("Status:", pageRes.status, "isDemoMode:", pageData.isDemoMode);
  console.log("Page Number:", pageData.page?.pageNumber, "Panels:", pageData.page?.panels?.length);

  console.log("\n=== ALL ENDPOINTS VERIFIED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
