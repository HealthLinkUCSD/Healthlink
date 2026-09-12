"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export function useMemberSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, value) => {
      setSession(value);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);
  return { session, ready };
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://healthlink-nine.vercel.app";
