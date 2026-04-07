import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || apiKey === "your_anthropic_api_key") {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY is not configured in the environment.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: {
    name?: string;
    category?: string;
    hsn_code?: string;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category =
    typeof body?.category === "string" ? body.category.trim() : "";
  const hsn =
    typeof body?.hsn_code === "string" ? body.hsn_code.trim() : "";

  if (!name) {
    return new Response(JSON.stringify({ error: "name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hsnPart = hsn ? ` HSN code: ${hsn}.` : "";
  const userContent =
    `Write a product description for a Nauvarah spiritual wellness product. Product: ${name}. Category: ${category || "general"}.${hsnPart} ` +
    `Write 3 sentences. Sentence 1: what the product is and its spiritual significance. Sentence 2: who should use it and why. ` +
    `Sentence 3: one specific placement or usage instruction. Tone: calm, knowing, premium. No fluff.`;

  const anthropic = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const msgStream = anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          messages: [{ role: "user", content: userContent }],
        });

        msgStream.on("text", (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });

        await msgStream.done();
        controller.close();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Generation failed";
        try {
          controller.enqueue(
            encoder.encode(`\n[Error: ${message}]`)
          );
          controller.close();
        } catch {
          /* closed */
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
