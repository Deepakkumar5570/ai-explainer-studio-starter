import OpenAI from "openai";
import { NextResponse } from "next/server";
import { storyboardSchema, type VisualStyle } from "@studio/shared";

export const runtime = "nodejs";
export const maxDuration = 30;

const allowedStyles: VisualStyle[] = ["animated_infographic", "whiteboard", "cinematic", "minimal_motion"];

function demoStoryboard(topic: string, style: VisualStyle, durationSeconds: 30 | 45 | 60, aspectRatio: "9:16" | "16:9" | "1:1") {
  const sceneCount = durationSeconds === 30 ? 4 : durationSeconds === 45 ? 5 : 6;
  const perScene = durationSeconds / sceneCount;
  const narrations = [
    `चलिए, ${topic} को आसान भाषा में समझते हैं।`,
    "सबसे पहले, इसकी मूल बात समझना ज़रूरी है।",
    "एक रोज़मर्रा के उदाहरण से इसे और आसान बनाते हैं।",
    "अब देखिए कि यह हमारे काम कैसे आता है।",
    "याद रखने वाली बात यह है कि सही समझ छोटे-छोटे कदमों से बनती है।",
    "अब इस विचार को अपने अगले उदाहरण पर लागू करके देखिए।"
  ];
  const visualByStyle: Record<VisualStyle, string> = {
    animated_infographic: "Clean infographic with one central icon, short Hindi labels and simple animated arrows.",
    whiteboard: "Hand-drawn black marker illustration on a warm whiteboard with minimal labels.",
    cinematic: "Cinematic Indian everyday-life scene, soft natural lighting, clear focal subject, no embedded text.",
    minimal_motion: "Minimal typography, geometric shapes and subtle motion on a clean background."
  };
  return {
    title: topic.slice(0, 80),
    language: "hi-IN" as const,
    durationSeconds,
    aspectRatio,
    style,
    scenes: Array.from({ length: sceneCount }, (_, i) => ({
      id: `scene-${i + 1}`,
      durationSeconds: perScene,
      narration: narrations[i % narrations.length],
      visualType: style,
      visualPrompt: visualByStyle[style],
      caption: narrations[i % narrations.length]
    }))
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    if (!topic || topic.length > 4000) {
      return NextResponse.json({ error: "Enter a topic/script of 1–4000 characters." }, { status: 400 });
    }
    if (!allowedStyles.includes(body.style)) {
      return NextResponse.json({ error: "Unsupported visual style." }, { status: 400 });
    }
    const durationSeconds = Number(body.durationSeconds);
    if (![30, 45, 60].includes(durationSeconds)) {
      return NextResponse.json({ error: "Duration must be 30, 45 or 60 seconds." }, { status: 400 });
    }
    const aspectRatio = body.aspectRatio;
    if (!["9:16", "16:9", "1:1"].includes(aspectRatio)) {
      return NextResponse.json({ error: "Unsupported aspect ratio." }, { status: 400 });
    }

    let output: unknown;
    if (!process.env.OPENAI_API_KEY) {
      output = demoStoryboard(topic, body.style, durationSeconds as 30 | 45 | 60, aspectRatio);
    } else {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.SCRIPT_MODEL || "gpt-4.1-mini",
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You write concise, accurate Hindi explainer video storyboards. Return only JSON matching this shape: {title,language:'hi-IN',durationSeconds,aspectRatio,style,scenes:[{id,durationSeconds,narration,visualType,visualPrompt,caption}]}. Use 4-6 scenes. Scene durations must sum exactly to durationSeconds. Write natural spoken Hindi in Devanagari, avoid filler, and use one idea per scene. visualPrompt must describe the chosen style. Never include unsupported factual claims. Do not put text inside image prompts." },
          { role: "user", content: JSON.stringify({ topic, style: body.style, durationSeconds, aspectRatio, language: "hi-IN" }) }
        ]
      });
      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("The script provider returned an empty response.");
      output = JSON.parse(raw);
    }
    const parsed = storyboardSchema.safeParse(output);
    if (!parsed.success) {
      return NextResponse.json({ error: "Storyboard validation failed. Try again with a simpler topic." }, { status: 502 });
    }
    const total = parsed.data.scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
    if (Math.abs(total - parsed.data.durationSeconds) > 0.05) {
      return NextResponse.json({ error: "Scene timings did not match the target duration. Please retry." }, { status: 502 });
    }
    return NextResponse.json(parsed.data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected generation error";
    return NextResponse.json({ error: message.includes("API key") ? "Script provider configuration failed." : "Could not generate a storyboard. Please try again." }, { status: 500 });
  }
}
