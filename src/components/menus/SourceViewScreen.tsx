import "./SourceViewScreen.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { soundSynth } from "@/core/SoundSynth";
import { sourceCodeManifest } from "@/core/sourceCodeManifest";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSourceViewKeyboard } from "@/hooks/useSourceViewKeyboard";
import { useCursorStore } from "@/store/useCursorStore";
import { SourceViewFooter } from "./SourceViewFooter";
import { Folder, FolderOpen, FileCode, FileText } from "lucide-react";

interface SourceViewScreenProps {
  onBack: () => void;
}

export interface FileNode {
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
          depth: i,
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
  const ext = filePath.split(".").pop() || "";
  if (ext === "tsx") return "tsx";
  if (ext === "ts") return "typescript";
  if (ext === "js" || ext === "jsx") return "javascript";
  if (ext === "css") return "css";
  if (ext === "json") return "json";
  if (ext === "md") return "markdown";
  return "text";
}

export function SourceViewScreen({ onBack }: SourceViewScreenProps) {
  const [manifest] = useState<Record<string, string>>(sourceCodeManifest);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    src: true,
    "src/components": true,
    "src/core": true,
  });

  const sortedPaths = useMemo(() => Object.keys(sourceCodeManifest).sort(), []);
  const [selectedFile, setSelectedFile] = useState<string>(sortedPaths[0] || "");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<"TOC" | "CODE">("TOC");

  const listRef = useRef<HTMLDivElement>(null);

  const treeRoot = useMemo(() => {
    const paths = Object.keys(sourceCodeManifest);
    return buildTree(paths);
  }, []);

  const visibleNodes = useMemo(() => {
    if (!treeRoot) return [];
    return flattenVisible(treeRoot, expandedDirs);
  }, [treeRoot, expandedDirs]);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleDownload = () => {
    soundSynth.playHitConfirm();
    const link = document.createElement("a");
    link.href = "./boxbattle_source_code.txt";
    link.download = "boxbattle_source_code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useSourceViewKeyboard({
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
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkRes = () => {
        setIsMobile(window.innerWidth <= 800);
      };
      checkRes();
      window.addEventListener("resize", checkRes);
      return () => window.removeEventListener("resize", checkRes);
    }
  }, []);

  useEffect(() => {
    if (activeIndex < visibleNodes.length) {
      const activeEl = listRef.current?.querySelector(".file-item-active");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex, visibleNodes.length]);

  return (
    <div
      className="flex-col h-full w-full"
      style={{ justifyContent: "space-between", boxSizing: "border-box", padding: "16px 12px" }}
    >
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            margin: 0,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
          }}
        >
          SOURCE BROWSER
        </h2>
        <p style={{ color: "#718096", margin: "4px 0 0", fontSize: "11px", letterSpacing: "0.15em" }}>
          {isMobile
            ? mobileView === "TOC"
              ? "TAP FILE TO VIEW  •  DRAG TO SCROLL"
              : "SWIPE TO SCROLL  •  TAP BUTTON TO EXIT CODE"
            : "UP/DOWN/LEFT/RIGHT: NAVIGATE  •  JUMP: ENTER/OPEN  •  ATTACK/DASH: EXIT"}
        </p>
      </div>

      <div className="source-view-workspace">
        {(!isMobile || mobileView === "TOC") && (
          <div
            ref={listRef}
            className="directory-tree-pane neo-pressed"
            style={{
              WebkitOverflowScrolling: "touch",
              width: isMobile ? "100%" : "24%",
              height: isMobile ? "100%" : "",
            }}
          >
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
                      if (isMobile) {
                        setMobileView("CODE");
                      }
                    }
                  }}
                  style={{
                    paddingTop: isMobile ? "14px" : "6px",
                    paddingBottom: isMobile ? "14px" : "6px",
                    paddingRight: isMobile ? "16px" : "10px",
                    paddingLeft: `${node.depth * (isMobile ? 22 : 16) + (isMobile ? 16 : 10)}px`,
                    borderRadius: "6px",
                    fontSize: isMobile ? "13px" : "11px",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
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
                    border: isActive ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid transparent",
                    textShadow: isActive ? "0 0 6px var(--signal-green-glow)" : "none",
                    wordBreak: "break-all",
                    transition: "all 0.12s ease",
                    textAlign: "left",
                  }}
                >
                  <span style={{ minWidth: "12px", fontSize: "10px" }}>
                    {node.isDir ? (isExpanded ? "▼" : "▶") : " "}
                  </span>
                  {node.isDir ? (
                    isExpanded ? <FolderOpen size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} /> : <Folder size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  ) : (
                    node.name.endsWith(".ts") || node.name.endsWith(".tsx") || node.name.endsWith(".js") ? (
                      <FileCode size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    ) : (
                      <FileText size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    )
                  )}
                  <span style={{ fontWeight: node.isDir ? "bold" : "normal" }}>{node.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {(!isMobile || mobileView === "CODE") && (
          <div
            onMouseOver={() => useCursorStore.getState().setCursorType("text")}
            onMouseLeave={() => useCursorStore.getState().setCursorType("default")}
            className="code-viewer-pane neo-pressed"
            style={{
              WebkitOverflowScrolling: "touch",
              width: isMobile ? "100%" : "76%",
              height: isMobile ? "100%" : "",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isMobile && (
              <button
                onClick={() => {
                  soundSynth.playSelectTick();
                  setMobileView("TOC");
                }}
                className="neo-btn"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "12px",
                  marginBottom: "12px",
                  borderColor: "var(--signal-green)",
                  color: "var(--signal-green)",
                  flexShrink: 0,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                📁 BACK TO DIRECTORY
              </button>
            )}

            {selectedFile ? (
              <div
                style={{
                  textAlign: "left",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    color: "hsl(142, 70%, 75%)",
                    marginBottom: "14px",
                    fontFamily: "monospace",
                    flexShrink: 0,
                    fontSize: isMobile ? "10px" : "11px",
                    wordBreak: "break-all",
                  }}
                >
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
                      fontSize: isMobile ? "10px" : "11px",
                      lineHeight: "1.5",
                    }}
                  >
                    {manifest[selectedFile] || ""}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <span style={{ color: "#4a5568", fontSize: "11px" }}>
                Select a file in the directory tree to view content.
              </span>
            )}
          </div>
        )}
      </div>

      <SourceViewFooter
        onBack={onBack}
        isMobile={isMobile}
        activeIndex={activeIndex}
        visibleNodesLength={visibleNodes.length}
        setActiveIndex={setActiveIndex}
      />
    </div>
  );
}
