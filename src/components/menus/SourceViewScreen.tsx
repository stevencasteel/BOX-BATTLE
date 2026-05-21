import { useEffect, useState, useRef } from "react";
import { soundSynth } from "@/core/SoundSynth";

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

      if (e.key === "ArrowDown" || e.key === "KeyS") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => (prev + 1) % visibleNodes.length);
      } else if (e.key === "ArrowUp" || e.key === "KeyW") {
        e.preventDefault();
        soundSynth.playSelectTick();
        setActiveIndex((prev) => (prev - 1 + visibleNodes.length) % visibleNodes.length);
      } else if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        soundSynth.playHitConfirm();
        const node = visibleNodes[activeIndex];
        if (node.isDir) {
          setExpandedDirs((prev) => ({
            ...prev,
            [node.path]: !prev[node.path]
          }));
        } else {
          setSelectedFile(node.path);
        }
      } else if (e.key === "Backspace" || e.key === "Escape") {
        e.preventDefault();
        soundSynth.playErrorTick();
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [visibleNodes, activeIndex, onBack]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector(".file-item-active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

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
      
      {/* 1. Header (Top) */}
      <div className="title-banner" style={{ marginTop: "0", paddingTop: "0" }}>
        <h2 style={{ fontSize: "1.8rem", margin: 0, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff" }}>SOURCE VIEWER</h2>
        <p style={{ color: "#718096", margin: "4px 0 0", fontSize: "11px", letterSpacing: "0.15em" }}>UP/DOWN: SCROLL  •  ENTER: EXPAND/OPEN  •  BACKSPACE: EXIT</p>
      </div>

      {/* 2. Fluid-Height Split Screen (Middle) */}
      <div style={{ display: "flex", gap: "16px", flexGrow: 1, height: "0", minHeight: "0", width: "100%", boxSizing: "border-box", margin: "14px 0" }}>
        
        {/* Left Pane: Directory Tree */}
        <div ref={listRef} className="neo-pressed" style={{ width: "38%", overflowY: "auto", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box" }}>
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

        {/* Right Pane: Monospaced Raw File Content */}
        <div className="neo-pressed" style={{ width: "62%", overflowY: "auto", borderRadius: "12px", padding: "16px", boxSizing: "border-box", background: "#06070a" }}>
          {selectedFile ? (
            <pre style={{ margin: 0, padding: 0, textAlign: "left", fontSize: "11px", lineHeight: "1.5", fontFamily: "monospace", color: "#a0aec0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              <code style={{ color: "hsl(142, 70%, 75%)" }}>// FILE: {selectedFile}</code>
              {"\n\n"}
              {manifest[selectedFile]}
            </pre>
          ) : (
            <span style={{ color: "#4a5568", fontSize: "11px" }}>Select a file in the directory tree to view content.</span>
          )}
        </div>

      </div>

      {/* 3. Navigation & Action Control Footer Row (Bottom) */}
      <div className="flex-row" style={{ width: "100%", justifyContent: "space-between", alignItems: "center", marginTop: "8px", boxSizing: "border-box" }}>
        
        {/* Left: GitHub Repository link with Inline Vector Icon */}
        <a 
          href="https://github.com/stevencasteel/BOX-BATTLE" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ fontSize: "11px", color: "#4a5568", letterSpacing: "0.15em", textDecoration: "none", transition: "color 0.15s ease", display: "flex", alignItems: "center", gap: "8px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--signal-green)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
        >
          <svg 
            viewBox="0 0 24 24" 
            width="14" 
            height="14" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ display: "inline-block" }}
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          GITHUB REPO
        </a>

        {/* Center: File Download Trigger */}
        <button
          onClick={handleDownload}
          className="neo-btn"
          style={{ padding: "16px 28px", fontSize: "14px" }}
        >
          DOWNLOAD SOURCE (.TXT)
        </button>

        {/* Right: Exit Navigation */}
        <button
          onClick={onBack}
          className="neo-btn neo-btn-focused"
          style={{ padding: "16px 32px", fontSize: "14px", width: "160px" }}
        >
          <span className="cursor-arrow">▶</span>
          Back
          <span className="cursor-arrow">◀</span>
        </button>

      </div>

    </div>
  );
}
