import { ZodSchema } from "zod";

export interface AIClientOptions {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

export function getEffectiveApiConfig(options?: AIClientOptions) {
  const envBaseUrl = process.env.STORYBOARD_BASE_URL;
  const envApiKey = process.env.STORYBOARD_API_KEY;
  const envModel = process.env.STORYBOARD_MODEL;

  const baseUrl = (options?.baseUrl || envBaseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const apiKey = options?.apiKey || envApiKey || "";
  const model = options?.model || envModel || "gpt-4o-mini";

  const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);

  return {
    baseUrl,
    apiKey,
    model,
    isConfigured,
  };
}

/**
 * Attempts to extract clean JSON string from text that might contain markdown fences or surrounding chatter
 */
export function extractJsonFromText(text: string): string {
  const trimmed = text.trim();

  // Check if enclosed in markdown code block ```json ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Look for the outer-most { ... } or [ ... ]
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = trimmed.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = trimmed.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return trimmed.slice(startIdx, endIdx + 1);
  }

  return trimmed;
}

export async function callLLMWithJson<T>(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  schema: ZodSchema<T>,
  options?: AIClientOptions
): Promise<{ data: T; isDemoMode: false; rawText?: string }> {
  const config = getEffectiveApiConfig(options);

  if (!config.isConfigured) {
    throw new Error("STORYBOARD_API_KEY 未配置，无法调用远程大语言模型。");
  }

  try {
    const parsedUrl = new URL(config.baseUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw new Error(`AI Base URL 无效: 必须以 http:// 或 https:// 开头且为合法网址 (当前: ${config.baseUrl})`);
  }

  const endpoint = `${config.baseUrl}/chat/completions`;

  const requestBody = {
    model: config.model,
    messages,
    temperature: 0.7,
    response_format: { type: "json_object" },
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000),
    });

    // Fallback: If HTTP 400 occurs and indicates response_format is unsupported by the model/endpoint, retry without it
    if (!response.ok && response.status === 400) {
      const cloned = response.clone();
      const errText = await cloned.text();
      if (errText.toLowerCase().includes("response_format")) {
        const fallbackBody = {
          model: config.model,
          messages,
          temperature: 0.7,
        };
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(fallbackBody),
          signal: AbortSignal.timeout(60000),
        });
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new Error("AI 服务请求超时（超过 60 秒），请检查网络连接或稍后重试。");
    }
    throw new Error(`连接 AI 服务失败: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI 服务请求失败 [HTTP ${response.status}]: ${errorText.slice(0, 300)}`);
  }

  const responseJson = await response.json();
  const content = responseJson.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI 返回了空响应，请重试。");
  }

  const cleanJson = extractJsonFromText(content);
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(`AI 返回内容未能解析为有效 JSON: ${cleanJson.slice(0, 150)}...`);
  }

  // Validate against Zod schema
  const parseResult = schema.safeParse(parsedJson);
  if (!parseResult.success) {
    console.error("Zod Validation Error:", parseResult.error.format());
    // In case top-level was wrapped in an envelope object like { result: ... } or { pages: ... }
    if (typeof parsedJson === "object" && parsedJson !== null) {
      const keys = Object.keys(parsedJson);
      for (const k of keys) {
        const subResult = schema.safeParse((parsedJson as Record<string, unknown>)[k]);
        if (subResult.success) {
          return { data: subResult.data, isDemoMode: false, rawText: content };
        }
      }
    }
    throw new Error(`AI 输出未完全符合分镜数据格式要求: ${parseResult.error.issues[0]?.message || "格式不匹配"}`);
  }

  return {
    data: parseResult.data,
    isDemoMode: false,
    rawText: content,
  };
}
