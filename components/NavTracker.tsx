"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPath } from "@/lib/nav-memory";

export default function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackPath(pathname);
  }, [pathname]);
  return null;
}
