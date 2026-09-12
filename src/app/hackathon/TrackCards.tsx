"use client";

import { useEffect, useRef, useState } from "react";
import { tracks } from "./tracks";
import styles from "./hackathon.module.css";

export default function TrackCards() {
  const [flipped, setFlipped] = useState<number[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const lastTrack = useRef<number | null>(null);
  useEffect(() => {
    if (lastTrack.current === null) return;
    const side = flipped.includes(lastTrack.current) ? "back" : "front";
    container.current?.querySelector<HTMLButtonElement>(`[data-focus="${lastTrack.current}-${side}"]`)?.focus({ preventScroll: true });
  }, [flipped]);
  return <div ref={container} className="grid gap-6 md:grid-cols-2">
    {tracks.map((track, index) => {
      const active = flipped.includes(index);
      return <div key={track.title} className={styles.card}>
        <div className={`${styles.inner} ${active ? styles.flipped : ""}`}>
          <button type="button" data-focus={`${index}-front`} className={`${styles.face} ${styles.front}`} tabIndex={active ? -1 : 0} aria-hidden={active} inert={active} aria-expanded={active} aria-label={`Explore track ${index + 1}: ${track.title}`} onClick={() => { lastTrack.current = index; setFlipped(values => [...values, index]); }}>
            <span className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-blue-200"><span>Track 0{index + 1}</span><span>Explore +</span></span>
            <span className="my-auto block"><span className={styles.title}>{track.short}</span></span>
            <span className="text-sm text-neutral-300">{track.partner}</span>
          </button>
          <div className={`${styles.face} ${styles.back}`} aria-hidden={!active} inert={!active}>
            <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Track 0{index + 1} / The brief</h3><button type="button" data-focus={`${index}-back`} className="rounded-full border border-blue-300/40 px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-300" onClick={() => { lastTrack.current = index; setFlipped(values => values.filter(value => value !== index)); }}>Flip back</button></div>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-200">
              <p><strong className="text-blue-200">Build</strong><br />{track.objective}</p>
              <div><p className="font-bold text-blue-200">Ideas to explore</p><ul className="list-disc space-y-1 pl-5">{track.ideas.map(idea => <li key={idea}>{idea}</li>)}</ul></div>
              <p className="border-t border-white/10 pt-4">{track.detail}</p>
            </div>
          </div>
        </div>
      </div>;
    })}
  </div>;
}
