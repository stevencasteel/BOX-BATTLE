import { useEffect, useState, useRef } from "react";
import { soundSynth } from "@/core/SoundSynth";
import { settingsManager } from "@/core/SettingsManager";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface SourceViewScreenProps {
  onBack: () => void;
}

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FileNode[];
  depth: number;
}

function buildTree(paths: string[]): FileNode {
  const root: FileNode = { name: "root", path: "", isDir: true, children: [], depth: -1 };

  paths.forEach((p) => {
    const parts = p.split("/");
    let current = root;

    parts.forEach((part, i) => {
      const isDir = i < parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: isDir ? currentPath : p,
          isDir,
          children: [],
          depth: i
        };
        current.children.push(child);
      }
      current = child;
    });
  });

  const sortNodes = (node: FileNode) => {
    node.children.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNodes);
  };
  sortNodes(root);

  return root;
}

function flattenVisible(node: FileNode, expanded: Record<string, boolean>, list: FileNode[] = []): FileNode[] {
  if (node.depth === -1) {
    node.children.forEach((child) => flattenVisible(child, expanded, list));
    return list;
  }

  list.push(node);

  if (node.isDir && expanded[node.path]) {
    node.children.forEach((child) => flattenVisible(child, expanded, list));
  }

  return list;
}

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop() || '';
  if (ext === 'tsx') return 'tsx';
  if (ext === 'ts') return 'typescript';
  if (ext === 'js' || ext === 'jsx') return 'javascript';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  if (ext === 'md') return 'markdown';
  return 'text';
}

export function SourceViewScreen({ onBack }: SourceViewScreenProps) {
  const [manifest, setManifest] = useState<Record<string, string>>({});
  const [treeRoot, setTreeRoot] = useState<FileNode | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    "src": true,
    "src/components": true,
    "src/core": true
  });
  
  const [visibleNodes, setVisibleNodes] = useState<FileNode[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string>("");
  
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("./source_code_manifest.json")
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);
        const paths = Object.keys(data);
        const root = buildTree(paths);
        setTreeRoot(root);
        
        const sortedPaths = paths.sort();
        if (sortedPaths.length > 0) {
          setSelectedFile(sortedPaths[0]);
        }
      })
      .catch((err) => console.error("Could not fetch code manifest:", err));
  }, []);

  useEffect(() => {
    if (!treeRoot) return;
    const list = flattenVisible(treeRoot, expandedDirs);
    setVisibleNodes(list);
    setActiveIndex((prev) => Math.min(prev, Math.max(0, list.length - 1)));
  }, [treeRoot, expandedDirs]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (visibleNodes.length === 0) return;

      const node = visibleNodes[activeIndex < visibleNodes.length ? activeIndex : 0];

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

      if (e.key === "ArrowDown" || e.key === "KeyS") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => {
          if (prev >= visibleNodes.length) {
            if (prev === visibleNodes.length + 2) {
              return 0;
            }
            return prev + 1;
          }
          if (prev === visibleNodes.length - 1) {
            return visibleNodes.length;
          }
          return prev + 1;
        });
      } else if (e.key === "ArrowUp" || e.key === "KeyW") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => {
          if (prev >= visibleNodes.length) {
            if (prev === visibleNodes.length) {
              return visibleNodes.length - 1;
            }
            return prev - 1;
          }
          if (prev === 0) {
            return visibleNodes.length + 2;
          }
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
            if (prev === visibleNodes.length + 2) {
              return 0;
            }
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
            setActiveIndex(visibleNodes.length + 2);
          }
        } else {
          setActiveIndex((prev) => {
            if (prev === visibleNodes.length) {
              return visibleNodes.length - 1;
            }
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
              [node.path]: !prev[node.path]
            }));
          } else {
            setSelectedFile(node.path);
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
  }, [visibleNodes, activeIndex, expandedDirs, onBack]);

  useEffect(() => {
    if (activeIndex < visibleNodes.length) {
      const activeEl = listRef.current?.querySelector(".file-item-active");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex, visibleNodes.length]);

  const handleDownload = () => {
    soundSynth.playHitConfirm();
    const link = document.createElement("a");
    link.href = "./all_source_code.txt";
    link.download = "all_source_code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-col h-full w-full" style={{ justifyContent: "space-between", boxSizing: "border-box", padding: "16px 0" }}>
      
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>SOURCE VIEWER</h2>
        <p style={{ color: "#718096", margin: "4px 0 0", fontSize: "11px", letterSpacing: "0.15em" }}>UP/DOWN/LEFT/RIGHT: NAVIGATE  •  JUMP: ENTER/OPEN  •  ATTACK/DASH: COLLAPSE/EXIT</p>
      </div>

      <div className="source-view-workspace">
        
        <div ref={listRef} className="directory-tree-pane neo-pressed">
          {visibleNodes.map((node, idx) => {
            const isActive = idx === activeIndex;
            const isExpanded = node.isDir && !!expandedDirs[node.path];
            const isCurrentlySelected = !node.isDir && node.path === selectedFile;

            return (
              <div
                key={node.path + "-" + idx}
                className={isActive ? "file-item-active" : ""}
                onClick={() => {
                  soundSynth.playSelectTick();
                  setActiveIndex(idx);
                  if (node.isDir) {
                    setExpandedDirs((prev) => ({ ...prev, [node.path]: !prev[node.path] }));
                  } else {
                    setSelectedFile(node.path);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  paddingLeft: `${node.depth * 16 + 10}px`,
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: isActive 
                    ? "var(--signal-green)" 
                    : isCurrentlySelected 
                      ? "#ffffff" 
                      : node.isDir 
                        ? "#718096" 
                        : "#4a5568",
                  background: isActive 
                    ? "rgba(34, 197, 94, 0.08)" 
                    : isCurrentlySelected 
                      ? "rgba(255, 255, 255, 0.03)" 
                      : "transparent",
                  border: isActive 
                    ? "1px solid rgba(34, 197, 94, 0.25)" 
                    : "1px solid transparent",
                  textShadow: isActive ? "0 0 6px var(--signal-green-glow)" : "none",
                  wordBreak: "break-all",
                  transition: "all 0.12s ease",
                  textAlign: "left"
                }}
              >
                <span style={{ minWidth: "12px", fontSize: "9px" }}>
                  {node.isDir ? (isExpanded ? "▼" : "▶") : " "}
                </span>
                <span style={{ fontSize: "12px" }}>
                  {node.isDir ? (isExpanded ? "📂" : "📁") : "📄"}
                </span>
                <span style={{ fontWeight: node.isDir ? "bold" : "normal" }}>
                  {node.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="code-viewer-pane neo-pressed">
          {selectedFile ? (
            <div style={{ textAlign: "left", fontSize: "11px", fontFamily: "monospace", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ color: "hsl(142, 70%, 75%)", marginBottom: "14px", fontFamily: "monospace", flexShrink: 0 }}>
                // FILE: {selectedFile}
              </div>
              <div style={{ flexGrow: 1, overflow: "auto" }}>
                <SyntaxHighlighter
                  language={getLanguageFromPath(selectedFile)}
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    fontSize: "11px",
                    lineHeight: "1.5",
                  }}
                >
                  {manifest[selectedFile] || ""}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <span style={{ color: "#4a5568", fontSize: "11px" }}>Select a file in the directory tree to view content.</span>
          )}
        </div>

      </div>

      <div className="source-view-footer flex-row">
        
        <a 
          href="https://github.com/stevencasteel/BOX-BATTLE" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`neo-btn ${activeIndex === visibleNodes.length ? "neo-btn-focused" : ""}`}
          style={{ padding: "16px 28px", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <span className="cursor-arrow" style={{ marginRight: "8px", visibility: activeIndex === visibleNodes.length ? "visible" : "hidden" }}>▶</span>
          <svg 
            viewBox="0 0 24 24" 
            width="14" 
            height="14" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ display: "inline-block", marginRight: "8px" }}
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          GITHUB REPO
          <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: activeIndex === visibleNodes.length ? "visible" : "hidden" }}>◀</span>
        </a>

        <button
          onClick={handleDownload}
          className={`neo-btn ${activeIndex === visibleNodes.length + 1 ? "neo-btn-focused" : ""}`}
          style={{ padding: "16px 28px", fontSize: "14px" }}
        >
          <span className="cursor-arrow" style={{ marginRight: "8px", visibility: activeIndex === visibleNodes.length + 1 ? "visible" : "hidden" }}>▶</span>
          DOWNLOAD SOURCE (.TXT)
          <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: activeIndex === visibleNodes.length + 1 ? "visible" : "hidden" }}>◀</span>
        </button>

        <button
          onClick={onBack}
          className={`neo-btn ${activeIndex === visibleNodes.length + 2 ? "neo-btn-focused" : ""}`}
          style={{ padding: "16px 32px", fontSize: "14px", width: "160px" }}
        >
          <span className="cursor-arrow" style={{ marginRight: "8px", visibility: activeIndex === visibleNodes.length + 2 ? "visible" : "hidden" }}>▶</span>
          Back
          <span className="cursor-arrow" style={{ marginLeft: "8px", visibility: activeIndex === visibleNodes.length + 2 ? "visible" : "hidden" }}>◀</span>
        </button>

      </div>

    </div>
  );
}
