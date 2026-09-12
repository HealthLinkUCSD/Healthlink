import type { Metadata } from "next";
import Link from "next/link";
import TrackCards from "./TrackCards";

export const metadata: Metadata = { title: "Hackathon 2026 | HealthLink UCSD", description: "Build a healthcare prototype October 2-4 at The Basement, UC San Diego. Signup deadline September 30." };

export default function HackathonPage() {
  return <main className="min-h-screen bg-gradient-to-b from-[#071225] via-[#0a1b35] to-[#102647] text-white">
    <header className="relative bg-cover bg-center px-6 pb-16 pt-32" style={{ backgroundImage: "url('/home/hero_bg_large.png')" }}>
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#071225]" />
      <div className="relative mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">HealthLink UCSD</p>
        <h1 className="mt-4 text-5xl font-extrabold sm:text-7xl">Hackathon 2026</h1>
        <p className="mt-5 text-xl text-blue-100 sm:text-2xl">Build a healthcare prototype in one weekend.</p>
        <dl className="mt-10 grid gap-6 border-y border-blue-300/20 py-6 sm:grid-cols-2">
          <div><dt className="text-xl font-medium text-blue-300">When</dt><dd className="mt-2 text-2xl font-bold">October 2-4</dd><dd className="mt-1 text-sm text-neutral-300">Daily schedule coming soon</dd></div>
          <div><dt className="text-xl font-medium text-blue-300">Where</dt><dd className="mt-2 text-2xl font-bold">The Basement</dd><dd className="mt-1 text-sm text-neutral-300">DIB Building, UC San Diego</dd></div>
        </dl>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="font-semibold">Sign up by September 30</p>
          <span className="rounded-full border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Signup form coming soon</span>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-5xl space-y-12 px-6 pb-16">
      <section id="tracks" className="scroll-mt-28 space-y-6">
        <div><h2 className="text-3xl font-medium text-blue-300">Choose a track</h2><p className="mt-2 text-neutral-300">Tap a card for the challenge and build ideas.</p></div>
        <TrackCards />
        <div className="space-y-2 border-b border-white/10 pb-6 text-sm text-neutral-300">
          <p><strong className="text-white">Deliver a working prototype by Sunday.</strong> Show a real problem, user validation, and what you built.</p>
          <p>OpenSwarm is free and optional for all tracks. If used, its effective application is evaluated.</p>
          <p className="text-neutral-400">Use synthetic or authorized, de-identified data. Prototypes are not for clinical use.</p>
        </div>
      </section>
      <section className="grid gap-8 sm:grid-cols-2">
        <div><h2 className="text-3xl font-medium text-blue-300">Funding & prizes</h2><p className="mt-3 text-neutral-300">Total funding and potential prizes coming soon.</p></div>
        <div><h2 className="text-3xl font-medium text-blue-300">Sponsors & partners</h2><Link href="/hackathon/sponsors" className="mt-3 inline-block text-blue-300 underline underline-offset-4 hover:text-blue-100">Meet the track partners</Link></div>
      </section>
      <section className="border-t border-white/10 pt-8"><h2 className="text-3xl font-medium text-blue-300">Last year</h2><p className="mt-3 text-neutral-300">Photos, prizes, and sponsors coming soon.</p></section>
      <p className="text-sm text-neutral-300">Questions? <a className="text-blue-300 underline" href="mailto:healthlink@ucsd.edu">healthlink@ucsd.edu</a></p>
    </div>
  </main>;
}
