import { useState, useEffect, startTransition } from "react";

export enum BootStage {
  NONE = 0,
  INITIALIZED = 1,
  ASSETS_PRELOADED = 2,
  ARENA_READY = 3,
}

export function useBootSequence() {
  const [bootStage, setBootStage] = useState<BootStage>(BootStage.NONE);

  useEffect(() => {
    startTransition(() => {
      setBootStage(BootStage.INITIALIZED);
    });

    const queuePreload = () => {
      startTransition(() => {
        setBootStage(BootStage.ASSETS_PRELOADED);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(queuePreload, { timeout: 800 });
    } else {
      setTimeout(queuePreload, 150);
    }

    const queueFullSystem = () => {
      startTransition(() => {
        setBootStage(BootStage.ARENA_READY);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(queueFullSystem, { timeout: 1500 });
    } else {
      setTimeout(queueFullSystem, 400);
    }
  }, []);

  return bootStage;
}
