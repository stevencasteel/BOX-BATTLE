import { soundSynth } from "@/core/SoundSynth";
import { Download, ArrowLeft } from "lucide-react";
import { MenuButton } from "./MenuPrimitives";

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

export function SourceViewFooter({
  onBack,
  isMobile,
  activeIndex,
  visibleNodesLength,
  setActiveIndex,
}: SourceViewFooterProps) {
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
          <button
            onClick={() => window.open("https://github.com/stevencasteel/BOX-BATTLE", "_blank")}
            className="neo-btn"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <GithubIcon />
          </button>
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
      <MenuButton
        isFocused={activeIndex === visibleNodesLength}
        onFocused={() => setActiveIndex(visibleNodesLength)}
        onClick={() => window.open("https://github.com/stevencasteel/BOX-BATTLE", "_blank")}
        leftIcon={<GithubIcon />}
        mainLabel="GITHUB REPO"
        subLabel="VIEW AND DOWNLOAD CODE ARCHIVE"
        style={{ flex: 1, boxSizing: "border-box" }}
      />

      <MenuButton
        isFocused={activeIndex === visibleNodesLength + 1}
        onFocused={() => setActiveIndex(visibleNodesLength + 1)}
        onClick={handleDownload}
        leftIcon={<Download size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
        mainLabel="DOWNLOAD SOURCE"
        subLabel="SAVE ALL CODE AS SINGLE .TXT FILE"
        style={{ flex: 1, boxSizing: "border-box" }}
      />

      <MenuButton
        isFocused={activeIndex === visibleNodesLength + 2}
        onFocused={() => setActiveIndex(visibleNodesLength + 2)}
        onClick={onBack}
        leftIcon={<ArrowLeft size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
        mainLabel="BACK TO MENU"
        subLabel="EXIT SOURCE CODE VIEW"
        style={{ flex: 1, boxSizing: "border-box" }}
      />
    </div>
  );
}
