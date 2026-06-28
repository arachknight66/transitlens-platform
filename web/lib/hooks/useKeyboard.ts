"use client";

import { useEffect } from "react";

export function useKeyboard(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options?: { meta?: boolean; ctrl?: boolean; enabled?: boolean }
) {
  const { meta = false, ctrl = false, enabled = true } = options ?? {};

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      const modifierOk =
        (!meta && !ctrl) ||
        (meta && e.metaKey) ||
        (ctrl && e.ctrlKey);

      if (e.key.toLowerCase() === key.toLowerCase() && modifierOk) {
        handler(e);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, meta, ctrl, enabled]);
}
