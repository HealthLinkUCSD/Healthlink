import Link from "next/link";
import type { Metadata } from "next";
import { partners } from "../partners";
export const metadata: Metadata = { title: "Hackathon Sponsors & Partners | HealthLink UCSD" };

export default function SponsorsPage() {
  return <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] px-6 py-32 text-white"><div className="mx-auto max-w-6xl space-y-14">
    <header className="max-w-3xl space-y-5"><Link href="/hackathon" className="text-blue-300 underline">Back to the hackathon</Link><p className="text-sm uppercase tracking-[0.2em] text-blue-300">HealthLink Hackathon / 2026</p><h1 className="text-5xl font-extrabold">Sponsors & partners</h1><p className="text-lg text-neutral-300">Domain expertise. Real problems. A community built to help students build.</p></header>
    <section className="space-y-6"><h2 className="text-3xl font-bold">Confirmed partners & sponsors</h2><div className="grid gap-6 md:grid-cols-3">{partners.map(({ name, role, description, url }) => <article key={name} className="flex flex-col rounded-3xl border border-blue-500/40 bg-white/5 p-8 shadow-lg shadow-blue-900/30"><p className="text-xs uppercase tracking-[0.2em] text-blue-300">{role}</p><h3 className="my-5 text-3xl font-extrabold">{name}</h3><p className="mb-6 leading-relaxed text-neutral-300">{description}</p><a href={url} target="_blank" rel="noreferrer" className="mt-auto text-sm font-semibold text-blue-300 underline underline-offset-4 hover:text-blue-100">Explore {name}<span className="sr-only"> (opens in a new tab)</span></a></article>)}</div></section>
  </div></main>;
}
