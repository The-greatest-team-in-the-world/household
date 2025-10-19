export type Avatar = {
  emoji: string;
  color: string;
};

export const avatarColors: Avatar[] = [
  { emoji: "🦊", color: "#E97424" },
  { emoji: "🐷", color: "#F4A6B0" },
  { emoji: "🐸", color: "#8ED973" },
  { emoji: "🐥", color: "#FFD74A" },
  { emoji: "🐙", color: "#C063A8" },
  { emoji: "🐬", color: "#2996BD" },
  { emoji: "🦉", color: "#8B6E4E" },
  { emoji: "🦄", color: "#C8A2FF" },
];

// Extraherar alla emojis från avatarColors-arrayen för validering
export const avatarEmojis = avatarColors.map((a) => a.emoji) as [
  string,
  ...string[],
];
