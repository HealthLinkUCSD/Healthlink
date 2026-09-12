import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Hackathon Sponsors & Partners | HealthLink UCSD" };

export default function SponsorsPage() {
  return <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] px-6 py-32 text-white"><div className="mx-auto max-w-6xl space-y-14">
    <header className="max-w-3xl space-y-5"><Link href="/hackathon" className="text-blue-300 underline">Back to the hackathon</Link><h1 className="text-5xl font-extrabold">Sponsors & partners</h1></header>
    <section className="space-y-6"><h2 className="text-3xl font-bold">Track partners</h2><div className="grid gap-6 md:grid-cols-3">{[["OpenSwarm", "Track 01", "Desktop orchestration for agentic diagnostic workflows. Available to every team across all tracks."], ["Harbor", "Track 02", "Clinical research and compliant EDC expertise, with a workshop before ideation opens."], ["CLD-9", "Track 03", "Personalized formulation and the Nexus platform, with Khushang judging."]].map(([name, track, description]) => <article key={name} className="rounded-3xl border border-blue-500/40 bg-white/5 p-8 shadow-lg shadow-blue-900/30"><p className="text-xs uppercase tracking-[0.2em] text-blue-300">{track}</p><h3 className="my-5 text-3xl font-extrabold">{name}</h3><p className="text-neutral-300">{description}</p></article>)}</div></section>
    <section className="border-t border-white/10 pt-8"><h2 className="text-2xl font-bold">Sponsors</h2><p className="mt-3 text-neutral-300">2026 and last year&apos;s sponsor lists coming soon.</p></section>
    <a href="mailto:healthlink@ucsd.edu?subject=HealthLink%20Hackathon%20Sponsorship" className="inline-block rounded-full bg-blue-500 px-6 py-3 font-semibold hover:bg-blue-400">Become a sponsor</a>
  </div></main>;
}
