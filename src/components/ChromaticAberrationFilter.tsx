export function ChromaticAberrationFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
      <defs>
        <filter id="chromatic-aberration">
          <feOffset dx="6" dy="0" in="SourceGraphic" result="red" />
          <feOffset dx="-6" dy="0" in="SourceGraphic" result="blue" />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="red"
            result="red-only"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="SourceGraphic"
            result="green-only"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            in="blue"
            result="blue-only"
          />
          <feBlend mode="screen" in="red-only" in2="green-only" result="rg" />
          <feBlend mode="screen" in="rg" in2="blue-only" />
        </filter>
      </defs>
    </svg>
  );
}
