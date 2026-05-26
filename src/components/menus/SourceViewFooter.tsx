import { soundSynth } from "@/core/SoundSynth";
import { Download, ArrowLeft } from "lucide-react";

interface SourceViewFooterProps {
  onBack: () => void;
  isMobile: boolean;
  activeIndex: number;
  visibleNodesLength: number;
  setActiveIndex: (idx: number) => void;
}

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function SourceViewFooter({ onBack, isMobile, activeIndex, visibleNodesLength, setActiveIndex }: SourceViewFooterProps) {
  const handleDownload = () => {
    soundSynth.playHitConfirm();
    const link = document.createElement("a");
    link.href = "./boxbattle_source_code.txt";
    link.download = "boxbattle_source_code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isMobile) {
    return (
      <div
        className="source-view-footer"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "8px",
          width: "100%",
          justifyContent: "space-between",
          boxSizing: "border-box",
          marginTop: "12px",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, display: "flex" }}>
          <a
            href="https://github.com/stevencasteel/BOX-BATTLE"
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <GithubIcon />
          </a>
        </div>

        <div style={{ flex: 1, display: "flex" }}>
          <button
            onClick={handleDownload}
            className="neo-btn"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          >
            <Download size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex" }}>
          <button
            onClick={onBack}
            className="neo-btn"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="source-view-footer"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
        marginTop: "12px",
        flexShrink: 0,
      }}
    >
      <a
        href="https://github.com/stevencasteel/BOX-BATTLE"
        target="_blank"
        rel="noopener noreferrer"
        className={`neo-btn-large ${activeIndex === visibleNodesLength ? "neo-btn-large-focused" : ""}`}
        style={{ flex: 1, textDecoration: "none", boxSizing: "border-box" }}
        onMouseEnter={() => {
          soundSynth.playSelectTick();
          setActiveIndex(visibleNodesLength);
        }}
      >
        <div className="btn-indicator-light" />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GithubIcon />
            GITHUB REPO
          </span>
          <span className="btn-sub-label">VIEW AND DOWNLOAD CODE ARCHIVE</span>
        </div>
        <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: activeIndex === visibleNodesLength ? "visible" : "hidden" }}>▶</span>
      </a>

      <button
        onClick={handleDownload}
        className={`neo-btn-large ${activeIndex === visibleNodesLength + 1 ? "neo-btn-large-focused" : ""}`}
        style={{ flex: 1, boxSizing: "border-box" }}
        onMouseEnter={() => {
          soundSynth.playSelectTick();
          setActiveIndex(visibleNodesLength + 1);
        }}
      >
        <div className="btn-indicator-light" />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Download size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            DOWNLOAD SOURCE
          </span>
          <span className="btn-sub-label">SAVE ALL CODE AS SINGLE .TXT FILE</span>
        </div>
        <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: activeIndex === visibleNodesLength + 1 ? "visible" : "hidden" }}>▶</span>
      </button>

      <button
        onClick={onBack}
        className={`neo-btn-large ${activeIndex === visibleNodesLength + 2 ? "neo-btn-large-focused" : ""}`}
        style={{ flex: 1, boxSizing: "border-box" }}
        onMouseEnter={() => {
          soundSynth.playSelectTick();
          setActiveIndex(visibleNodesLength + 2);
        }}
      >
        <div className="btn-indicator-light" />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowLeft size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            BACK TO MENU
          </span>
          <span className="btn-sub-label">EXIT SOURCE CODE VIEW</span>
        </div>
        <span className="cursor-arrow" style={{ marginLeft: "auto", visibility: activeIndex === visibleNodesLength + 2 ? "visible" : "hidden" }}>▶</span>
      </button>
    </div>
  );
}
