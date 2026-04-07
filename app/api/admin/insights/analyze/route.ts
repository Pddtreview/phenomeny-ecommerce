import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { gatherMarketingInsights } from "@/lib/marketing-insights";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a D2C e-commerce growth advisor for Nauvarah, an Indian spiritual wellness brand selling pyrite, crystals and vastu products. Analyse the data provided and give 5 specific, actionable insights the brand owner can act on this week. Be direct. No fluff. Focus on revenue, RTO reduction, repeat purchases and ad spend efficiency.`;

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || apiKey === "your_anthropic_api_key") {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY is not configured in the environment.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let supabase;
  try {
    supabase = createSupabaseServiceRoleClient();
  } catch {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const metrics = await gatherMarketingInsights(supabase, 30);

  const userContent = `JSON metrics (last 30 days):\n${JSON.stringify(metrics, null, 2)}\n\nRespond in markdown with exactly 5 insights. Each insight MUST begin with ## Headline on its own line, then 2-3 short sentences in the following lines. No introduction before the first ##. No other level-1 or level-2 headings except these five.`;

  const anthropic = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const preamble = `---METRICS---\n${JSON.stringify(metrics)}\n---STREAM---\n`;
        controller.enqueue(encoder.encode(preamble));

        const msgStream = anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        });

        msgStream.on("text", (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });

        await msgStream.done();
        controller.close();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to generate insights";
        try {
          controller.enqueue(
            encoder.encode(`\n\n— Could not complete analysis: ${message}`)
          );
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
