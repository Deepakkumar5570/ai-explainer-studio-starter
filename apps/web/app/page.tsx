"use client";

import { useMemo, useState } from "react";
import type { Storyboard } from "@studio/shared";
import { storyboardSchema } from "@studio/shared";

const styles = [
  { id: "animated_infographic", title: "Animated infographic", desc: "Icons, labels and motion" },
  { id: "whiteboard", title: "Whiteboard", desc: "Hand-drawn teaching" },
  { id: "cinematic", title: "Cinematic story", desc: "Atmospheric scene cards" },
  { id: "minimal_motion", title: "Minimal motion", desc: "Typography and shapes" },
] as const;

export default function HomePage() {
  const [topic, setTopic] = useState("Machine Learning को आसान हिंदी में समझाओ");
  const [style, setStyle] = useState<(typeof styles)[number]["id"]>("animated_infographic");
  const [duration, setDuration] = useState("45");
  const [ratio, setRatio] = useState("9:16");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);

  const selectedStyle = useMemo(() => styles.find((s) => s.id === style), [style]);

  async function generate() {
    setBusy(true); setError(""); setStoryboard(null);
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, durationSeconds: Number(duration), aspectRatio: ratio, language: "hi-IN" }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error((data as { error?: string }).error || "Generation failed");
      const parsed = storyboardSchema.safeParse(data);
      if (!parsed.success) throw new Error("The storyboard response did not match the expected format.");
      setStoryboard(parsed.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return (
    <main className="shell">
      <header className="topbar"><div className="brand">frame<span>wise</span> <span style={{color:"var(--muted)",fontWeight:400}}>studio</span></div><div className="pill">HINDI-FIRST VIDEO LAB · MVP</div></header>
      <section className="hero">
        <div className="eyebrow">Your idea, scene by scene</div>
        <h1>Ideas ko video mein<br/>badlo.</h1>
        <p>Topic ya script likho. Apna visual style chuno. AI tumhare liye Hindi narration-ready storyboard banayega.</p>
      </section>
      <section className="workspace">
        <div className="panel">
          <h2>01 / Create your video</h2>
          <div className="field"><label htmlFor="topic">Topic or script</label><textarea id="topic" value={topic} onChange={(e)=>setTopic(e.target.value)} maxLength={4000} placeholder="Apna topic ya script yahan likho..."/><small style={{color:"var(--muted)"}}>{topic.length}/4000 characters</small></div>
          <div className="field"><label>Visual style</label><div className="styles">{styles.map((s)=><button type="button" key={s.id} onClick={()=>setStyle(s.id)} className={`style ${style===s.id?"active":""}`}><strong>{s.title}</strong><small>{s.desc}</small></button>)}</div></div>
          <div className="row">
            <div className="field"><label htmlFor="duration">Duration</label><select id="duration" value={duration} onChange={(e)=>setDuration(e.target.value)}><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option></select></div>
            <div className="field"><label htmlFor="ratio">Format</label><select id="ratio" value={ratio} onChange={(e)=>setRatio(e.target.value)}><option value="9:16">Vertical · 9:16</option><option value="16:9">Landscape · 16:9</option><option value="1:1">Square · 1:1</option></select></div>
          </div>
          <button className="primary" disabled={busy || !topic.trim()} onClick={generate}>{busy?"Building storyboard…":"Generate storyboard →"}</button>
        </div>
        <div className="panel preview">
          <h2>02 / Preview</h2>
          <div className="previewBox"><div className="sample"><div className="eyebrow">{selectedStyle?.title}</div><div className="big">{storyboard?.title ?? "Har idea ki apni kahani."}</div><div className="sub">{storyboard ? `${storyboard.scenes.length} scenes · ${storyboard.durationSeconds}s · ${storyboard.aspectRatio}` : "Your storyboard preview will appear here."}</div></div></div>
          <div className="previewMeta"><span>Language · Hindi (hi-IN)</span><span>Voice · Natural narrator</span></div>
          {error && <div className="status error">{error}</div>}
          {storyboard && <><div className="status">Storyboard ready. Demo mode creates a script plan; voice generation and MP4 export are next integration steps.</div><div className="scenes">{storyboard.scenes.map((scene,i)=><article className="scene" key={scene.id}><h3>SCENE {i+1} · {scene.durationSeconds}s</h3><p>{scene.narration}</p><p style={{color:"var(--muted)",marginTop:6}}>{scene.visualPrompt}</p></article>)}</div><button className="secondary" style={{marginTop:12}} onClick={()=>navigator.clipboard.writeText(JSON.stringify(storyboard,null,2))}>Copy storyboard JSON</button></>}
        </div>
      </section>
      <p className="foot">MVP preview · Generated scripts need human review. Real TTS, image generation, queue processing and MP4 rendering are intentionally separate next steps.</p>
    </main>
  );
}
