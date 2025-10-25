export type AttrKey =
  | "accurate" | "cunning" | "discreet" | "persuasive"
  | "quick" | "resolute" | "strong" | "vigilant";

export const ATTR_LABEL: Record<AttrKey, string> = {
  accurate: "Accurate",
  cunning: "Cunning",
  discreet: "Discreet",
  persuasive: "Persuasive",
  quick: "Quick",
  resolute: "Resolute",
  strong: "Strong",
  vigilant: "Vigilant",
};

export function rollUnder(target: number, mod = 0) {
  const d = Math.floor(Math.random() * 20) + 1;
  const totalTarget = Math.max(1, Math.min(20, target + mod));
  const success = d <= totalTarget;
  return { d, target: totalTarget, success };
}
