type AudioTitleWaveVariant = "bass" | "groove" | "spark";

const WAVE_PATHS: Record<
  AudioTitleWaveVariant,
  [string, string, string]
> = {
  bass: [
    "M4 50C3 27 9 13 23 8C33 4 42 10 50 6C60 2 69 10 79 7C92 12 97 29 96 50C98 70 91 87 78 92C68 96 59 90 50 94C39 98 29 91 20 93C8 86 2 69 4 50Z",
    "M7 50C5 31 12 17 26 12C36 8 43 14 51 10C61 6 70 13 80 11C90 18 95 32 93 50C96 66 88 82 76 88C66 91 58 86 49 90C38 93 31 87 21 89C11 81 5 67 7 50Z",
    "M2 50C5 41 1 34 8 26C15 20 14 12 25 10C34 13 39 4 49 8C58 3 65 13 74 9C84 13 87 19 93 27C98 35 94 43 98 51C94 60 98 67 91 75C85 84 78 83 72 91C62 87 58 97 48 92C39 98 32 88 23 92C14 86 12 79 6 72C1 65 5 58 2 50Z",
  ],
  groove: [
    "M4 50C5 33 7 18 22 10C31 5 39 12 48 7C58 1 66 11 77 7C91 11 96 29 95 49C99 67 91 84 78 91C68 96 59 88 49 94C40 99 30 89 19 93C7 84 3 68 4 50Z",
    "M8 50C4 37 12 28 9 18C21 19 25 8 36 12C44 5 52 15 60 9C69 14 77 7 84 15C86 25 96 32 92 43C97 52 89 60 94 69C83 73 82 84 71 84C64 92 54 84 47 91C38 85 29 93 22 84C11 82 13 70 6 65C12 57 4 54 8 50Z",
    "M2 50C7 44 0 38 7 32C1 25 12 23 8 16C18 18 21 7 30 12C36 3 43 12 50 6C57 13 64 3 70 12C79 7 82 18 91 16C87 25 99 27 92 34C99 40 91 46 98 52C91 59 99 65 91 71C96 79 84 79 87 87C77 84 74 96 65 90C58 98 51 88 44 94C37 86 29 97 24 88C14 92 13 80 5 82C9 73-2 69 6 63C0 57 7 54 2 50Z",
  ],
  spark: [
    "M5 50C2 31 11 14 25 9C35 5 42 11 50 5C59 10 68 3 78 9C93 16 97 31 95 50C98 68 89 85 76 92C66 88 59 98 49 93C38 99 31 88 20 92C7 83 3 68 5 50Z",
    "M8 50C7 36 10 21 24 14C34 9 42 16 51 11C60 6 69 16 79 12C90 20 94 34 92 50C95 65 88 79 76 87C66 91 59 84 49 90C39 94 31 84 21 88C11 79 6 65 8 50Z",
    "M1 50L6 43L3 36L10 30L7 22L16 20L17 12L26 14L32 6L40 11L49 3L56 11L65 6L70 14L80 11L83 20L93 22L90 31L98 37L93 44L99 52L93 60L97 68L89 73L91 82L81 83L76 92L67 88L59 97L51 91L42 98L35 90L25 94L21 85L11 84L13 75L4 69L8 61Z",
  ],
};

export default function AudioTitleWave({
  variant = "groove",
}: {
  variant?: AudioTitleWaveVariant;
}) {
  const [bass, mid, treble] = WAVE_PATHS[variant];

  return (
    <svg
      className={`audio-title-wave audio-title-wave--${variant}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="audio-title-wave__bass" d={bass} pathLength="1" vectorEffect="non-scaling-stroke" />
      <path className="audio-title-wave__mid" d={mid} pathLength="1" vectorEffect="non-scaling-stroke" />
      <path className="audio-title-wave__treble" d={treble} pathLength="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
