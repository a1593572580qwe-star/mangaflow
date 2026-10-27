import { NextResponse } from "next/server";
import { getEffectiveApiConfig } from "@/lib/ai/client";

export async function GET() {
  const config = getEffectiveApiConfig();

  return NextResponse.json({
    isConfigured: config.isConfigured,
    baseUrl: config.baseUrl,
    model: config.model,
    // Never expose the actual API key to the client
    hasApiKey: Boolean(config.apiKey && config.apiKey.length > 0),
  });
}
