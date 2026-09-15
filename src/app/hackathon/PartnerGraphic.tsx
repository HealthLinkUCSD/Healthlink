import Image from "next/image";

export default function PartnerGraphic() {
  return <div className="overflow-hidden rounded-2xl border border-white/10">
    <Image src="/hackathon/partners-2026.png" width={1039} height={527} sizes="(max-width: 768px) 100vw, 1100px" alt="UC San Diego The Basement, CLD9, Rho, OpenSwarm, Harbor, and Raisi logos" className="h-auto w-full" />
  </div>;
}
