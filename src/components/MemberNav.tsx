"use client";

import Link from "next/link";
import { useMemberSession } from "@/lib/memberSession";

export default function MemberNav() {
  const { session, ready } = useMemberSession();
  return <Link href="/join" className="rounded-full bg-blue-500 px-3 py-2">{!ready ? "Account" : session ? "My membership" : "Join / Log in"}</Link>;
}
