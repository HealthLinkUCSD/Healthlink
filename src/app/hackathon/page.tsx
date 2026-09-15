import type { Metadata } from "next";
import Link from "next/link";
import TrackCards from "./TrackCards";
import PastHackathonGallery from "./PastHackathonGallery";

export const metadata: Metadata = { title: "Hackathon 2026 | HealthLink UCSD", description: "Build a working life-sciences prototype with HealthLink, October 2-4 at The Basement. Four tracks. Signup deadline September 30." };
const button = "inline-block rounded-full bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-400 transition";

export default function HackathonPage() {
  return <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] text-white">
    <section className="relative overflow-hidden bg-cover bg-center px-6 pb-24 pt-36 text-center" style={{ backgroundImage: "url('/home/hero_bg_large.png')" }}>
      <div className="absolute inset-0 bg-black/65" /><div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#071225]" />
      <div className="relative mx-auto max-w-4xl space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">HealthLink UCSD / October 2-4, 2026</p>
        <h1 className="text-5xl font-extrabold leading-tight sm:text-7xl">HealthLink Hackathon</h1>
        <p className="text-xl text-blue-100 sm:text-2xl">Build something that moves healthcare forward.</p>
        <p className="mx-auto max-w-2xl text-neutral-300">Three days. Four tracks. A working prototype by Sunday. Bring a problem worth solving and turn it into something real.</p>
        <div className="flex flex-wrap justify-center gap-3"><a href="#signup" className={button}>Signup details</a><a href="#tracks" className="rounded-full border border-white/25 px-6 py-3 font-semibold hover:bg-white/10">Explore the tracks</a></div>
        <p className="text-sm text-blue-200">Signup deadline: September 30</p>
      </div>
    </section>
    <div className="mx-auto max-w-6xl space-y-20 px-6 pb-20">
      <section aria-label="Event essentials" className="grid gap-4 sm:grid-cols-3">
        {[ ["When", "October 2-4, 2026", "Daily schedule coming soon"], ["Where", "The Basement", "DIB Building, UC San Diego"], ["Funding & potential prizes", "Coming soon", "Total amount to be announced"] ].map(([label, value, note]) => <div key={label} className="rounded-3xl border border-blue-500/30 bg-white/5 p-6 shadow-lg shadow-blue-900/20"><p className="text-xs uppercase tracking-[0.18em] text-blue-300">{label}</p><h2 className="mt-4 text-2xl font-bold">{value}</h2><p className="mt-2 text-sm text-neutral-300">{note}</p></div>)}
      </section>
      <section id="tracks" className="scroll-mt-28 space-y-8">
        <div><p className="text-xs uppercase tracking-[0.2em] text-blue-300">Choose your challenge</p><h2 className="mt-3 text-4xl font-extrabold">Four tracks. Room to make your mark.</h2><p className="mt-4 text-neutral-300">Click or tap a square to flip it and explore the brief, partner, and build ideas.</p></div>
        <TrackCards />
        <div className="rounded-3xl border border-blue-500/30 bg-white/5 p-6 space-y-3"><h3 className="text-xl font-bold">OpenSwarm is optional. Building is not.</h3><p className="text-neutral-300">OpenSwarm is free, open source, and available to every team, regardless of track. Teams that use it will be evaluated on how effectively they put it to work.</p><p className="text-sm text-blue-200">Build with synthetic or appropriately authorized, de-identified data. Hackathon prototypes are for demonstration, not clinical use.</p></div>
      </section>
      <section className="rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-600/20 to-transparent p-8 sm:p-10"><p className="text-xs uppercase tracking-[0.2em] text-blue-300">Our ecosystem</p><h2 className="mt-3 text-4xl font-extrabold">Partners behind the problems.</h2><p className="my-5 max-w-2xl text-neutral-300">Meet the track partners bringing domain expertise to the weekend. The sponsorship lineup is coming soon.</p><Link href="/hackathon/sponsors" className={button}>Sponsors & partners</Link></section>
      <section id="last-year" className="scroll-mt-28 space-y-6"><h2 className="text-3xl font-medium text-blue-300">Last year at HealthLink</h2><PastHackathonGallery /></section>
      <section id="signup" className="scroll-mt-28 rounded-3xl border border-blue-400/40 bg-blue-500/10 p-8 text-center sm:p-12"><h2 className="text-3xl font-medium text-blue-300">Applications</h2><p className="mt-4 text-lg text-neutral-200">Signup deadline: September 30, 2026.</p><p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-blue-200">Google signup form coming soon.</p><p className="mt-4 text-sm text-neutral-300">Questions? <a className="underline hover:text-blue-200" href="mailto:healthlink@ucsd.edu">healthlink@ucsd.edu</a></p></section>
    </div>
  </main>;
}
