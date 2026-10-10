import { z } from "zod";

export const visualStyleSchema = z.enum([
  "animated_infographic",
  "whiteboard",
  "cinematic",
  "minimal_motion",
]);
export type VisualStyle = z.infer<typeof visualStyleSchema>;

export const sceneSchema = z.object({
  id: z.string().min(1).max(80),
  durationSeconds: z.number().positive().max(60),
  narration: z.string().min(1).max(700),
  visualType: z.string().min(1).max(80),
  visualPrompt: z.string().min(1).max(1200),
  caption: z.string().min(1).max(240),
});

export const storyboardSchema = z.object({
  title: z.string().min(1).max(120),
  language: z.literal("hi-IN"),
  durationSeconds: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  style: visualStyleSchema,
  scenes: z.array(sceneSchema).min(3).max(8),
}).superRefine((storyboard, ctx) => {
  const total = storyboard.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
  if (Math.abs(total - storyboard.durationSeconds) > 0.05) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Scene durations must sum to target duration." });
  }
});

export type Scene = z.infer<typeof sceneSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;

export const generationJobStatusSchema = z.enum([
  "queued", "processing", "completed", "failed", "cancelled"
]);
export type GenerationJobStatus = z.infer<typeof generationJobStatusSchema>;
