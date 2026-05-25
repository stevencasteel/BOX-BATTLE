import { soundSynth } from "@/core/SoundSynth";

interface SourceViewFooterProps {
  onBack: () => void;
  isMobile: boolean;
  activeIndex: number;
  visibleNodesLength: number;
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

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BackIcon() {
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function SourceViewFooter({ onBack, isMobile, activeIndex, visibleNodesLength }: SourceViewFooterProps) {
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
            <DownloadIcon />
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
            <BackIcon />
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
      >
        <div className="btn-indicator-light" />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GithubIcon />
            GITHUB REPO
          </span>
          <span className="btn-sub-label">VIEW AND DOWNLOAD CODE ARCHIVE</span>
        </div>
        {activeIndex === visibleNodesLength && <span className="cursor-arrow-large">▶</span>}
      </a>

      <button
        onClick={handleDownload}
        className={`neo-btn-large ${activeIndex === visibleNodesLength + 1 ? "neo-btn-large-focused" : ""}`}
        style={{ flex: 1, boxSizing: "border-box" }}
      >
        <div className="btn-indicator-light" />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DownloadIcon />
            DOWNLOAD SOURCE
          </span>
          <span className="btn-sub-label">SAVE ALL CODE AS SINGLE .TXT FILE</span>
        </div>
        {activeIndex === visibleNodesLength + 1 && <span className="cursor-arrow-large">▶</span>}
      </button>

      <button
        onClick={onBack}
        className={`neo-btn-large ${activeIndex === visibleNodesLength + 2 ? "neo-btn-large-focused" : ""}`}
        style={{ flex: 1, boxSizing: "border-box" }}
      >
        <div className="btn-indicator-light" />
        <div className="btn-label-group">
          <span className="btn-main-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BackIcon />
            BACK TO MENU
          </span>
          <span className="btn-sub-label">EXIT SOURCE CODE VIEW</span>
        </div>
        {activeIndex === visibleNodesLength + 2 && <span className="cursor-arrow-large">▶</span>}
      </button>
    </div>
  );
}
