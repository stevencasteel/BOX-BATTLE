import { useEffect } from "react";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { FileNode } from "@/components/menus/SourceViewScreen";

interface UseSourceViewKeyboardOptions {
  visibleNodes: FileNode[];
  activeIndex: number;
  setActiveIndex: (index: number | ((prev: number) => number)) => void;
  expandedDirs: Record<string, boolean>;
  setExpandedDirs: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  setSelectedFile: (path: string) => void;
  onBack: () => void;
  isMobile: boolean;
  mobileView: "TOC" | "CODE";
  setMobileView: (view: "TOC" | "CODE") => void;
  handleDownload: () => void;
}

export function useSourceViewKeyboard({
  visibleNodes,
  activeIndex,
  setActiveIndex,
  expandedDirs,
  setExpandedDirs,
  setSelectedFile,
  onBack,
  isMobile,
  mobileView,
  setMobileView,
  handleDownload,
}: UseSourceViewKeyboardOptions) {
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (visibleNodes.length === 0) return;

      const keyMap = settingsManager.getKeyMap();
      const jumpKeys = keyMap["JUMP"] || [];
      const attackKeys = keyMap["ATTACK"] || [];
      const dashKeys = keyMap["DASH"] || [];

      const isConfirmKey =
        e.key === "Enter" ||
        e.key === " " ||
        e.code === "Space" ||
        jumpKeys.includes(e.code) ||
        jumpKeys.includes(e.key);

      const isBackKey =
        e.key === "Escape" ||
        e.key === "Backspace" ||
        attackKeys.includes(e.code) ||
        attackKeys.includes(e.key) ||
        dashKeys.includes(e.code) ||
        dashKeys.includes(e.key);

      if (isMobile && mobileView === "CODE") {
        if (isBackKey || e.key === "ArrowLeft" || e.key === "KeyA") {
          e.preventDefault();
          soundSynth.playSelectTick();
          setMobileView("TOC");
          return;
        }
      }

      const node = visibleNodes[activeIndex < visibleNodes.length ? activeIndex : 0];

      if (e.key === "ArrowDown" || e.key === "KeyS") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => {
          if (prev >= visibleNodes.length) {
            if (prev === visibleNodes.length + 2) return 0;
            return prev + 1;
          }
          if (prev === visibleNodes.length - 1) return visibleNodes.length;
          return prev + 1;
        });
      } else if (e.key === "ArrowUp" || e.key === "KeyW") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => {
          if (prev >= visibleNodes.length) {
            if (prev === visibleNodes.length) return visibleNodes.length - 1;
            return prev - 1;
          }
          if (prev === 0) return visibleNodes.length + 2;
          return prev - 1;
        });
      } else if (e.key === "ArrowRight" || e.key === "KeyD") {
        e.preventDefault();
        soundSynth.playSelectTick();
        if (activeIndex < visibleNodes.length) {
          if (node.isDir && !expandedDirs[node.path]) {
            setExpandedDirs((prev) => ({ ...prev, [node.path]: true }));
          }
        } else {
          setActiveIndex((prev) => {
            if (prev === visibleNodes.length + 2) return 0;
            return prev + 1;
          });
        }
      } else if (e.key === "ArrowLeft" || e.key === "KeyA") {
        e.preventDefault();
        soundSynth.playSelectTick();
        if (activeIndex < visibleNodes.length) {
          if (node.isDir && expandedDirs[node.path]) {
            setExpandedDirs((prev) => ({ ...prev, [node.path]: false }));
          } else {
            const parts = node.path.split("/");
            if (parts.length > 1) {
              const parentPath = parts.slice(0, -1).join("/");
              const parentIdx = visibleNodes.findIndex((n) => n.isDir && n.path === parentPath);
              if (parentIdx !== -1) {
                setActiveIndex(parentIdx);
                return;
              }
            }
            setActiveIndex(visibleNodes.length + 2);
          }
        } else {
          setActiveIndex((prev) => {
            if (prev === visibleNodes.length) return visibleNodes.length - 1;
            return prev - 1;
          });
        }
      } else if (isConfirmKey) {
        e.preventDefault();
        if (activeIndex < visibleNodes.length) {
          soundSynth.playHitConfirm();
          if (node.isDir) {
            setExpandedDirs((prev) => ({
              ...prev,
              [node.path]: !prev[node.path],
            }));
          } else {
            setSelectedFile(node.path);
            if (isMobile) setMobileView("CODE");
          }
        } else if (activeIndex === visibleNodes.length) {
          soundSynth.playHitConfirm();
          window.open("https://github.com/stevencasteel/BOX-BATTLE", "_blank");
        } else if (activeIndex === visibleNodes.length + 1) {
          handleDownload();
        } else if (activeIndex === visibleNodes.length + 2) {
          soundSynth.playErrorTick();
          onBack();
        }
      } else if (isBackKey) {
        e.preventDefault();
        if (activeIndex < visibleNodes.length) {
          if (node.isDir && expandedDirs[node.path]) {
            soundSynth.playErrorTick();
            setExpandedDirs((prev) => ({ ...prev, [node.path]: false }));
          } else {
            soundSynth.playSelectTick();
            setActiveIndex(visibleNodes.length + 2);
          }
        } else {
          if (activeIndex === visibleNodes.length + 2) {
            soundSynth.playErrorTick();
            onBack();
          } else {
            soundSynth.playSelectTick();
            setActiveIndex(visibleNodes.length + 2);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [visibleNodes, activeIndex, expandedDirs, onBack, isMobile, mobileView, setActiveIndex, setExpandedDirs, setSelectedFile, setMobileView, handleDownload]);
}
