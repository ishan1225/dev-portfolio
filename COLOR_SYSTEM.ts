/**
 * COLOR SYSTEM — 60/30/10 Rule
 * 
 * 60% NEUTRALS (backgrounds, structure, borders):
 *   void, bg, teal, purple
 * 
 * 30% INFORMATION (readable text, labels, metadata):
 *   silver, brightSilver, warmGray, deepTeal, cyan
 * 
 * 10% ACCENT (sparingly — actions, emphasis, impact):
 *   green   → ONLY for: buttons, bullets (▸), enter console, available dot
 *   mint    → ONLY for: your name in hero (nowhere else)
 *   amber   → ONLY for: impact badges on projects (the one warm element)
 * 
 * CRITICAL RULES:
 * - Project/experience titles are SILVER (#B8B8C8) collapsed, BRIGHT SILVER (#D4D4E0) expanded
 *   NEVER mint, NEVER cyan, NEVER green
 * - Skill chips AND project tech tags use the SAME style: silver text, teal bg, teal border
 *   They are metadata, not decoration
 * - GitHub/Demo buttons: green outline, fill solid green on hover (bg becomes green, text becomes bg)
 * - Skill group labels (FRONTEND, BACKEND, INFRA): deepTeal color, not green
 * - Experience expand border: deepTeal (3px left), NOT green
 * - Project expand border: green at 40% opacity (3px left)
 */

export const colors = {
  // 60% — Neutrals
  void: "#181825",        // Deepest background, behind everything
  bg: "#222035",          // Primary background (page body)
  teal: "#2F404D",        // Borders, card backgrounds, dividers, chip backgrounds
  purple: "#575267",      // Disabled states, inactive text, +/- indicators (collapsed)

  // 30% — Information
  warmGray: "#8D8980",    // Section labels (ABOUT, SKILLS, etc), metadata, timestamps
  silver: "#B8B8C8",      // Body text, descriptions, chip text, collapsed titles
  brightSilver: "#D4D4E0", // Expanded titles (subtle emphasis, NOT a color change)
  deepTeal: "#3D898D",    // Skill group labels, experience expand border, structural accent
  cyan: "#85EBD9",        // Sticky mobile bar links, secondary interactive text

  // 10% — Accent (use sparingly)
  green: "#65DC98",       // Action buttons, bullets, console trigger, available dot
  mint: "#A0FFE3",        // Hero name ONLY
  amber: "#FFB366",       // Impact badges ONLY (the warm pop)
} as const;

// Chip/tag style (reuse for BOTH skill chips and project tech tags)
export const chipStyle = {
  padding: "4px 11px",
  borderRadius: "4px",
  fontSize: "0.75rem",      // ~12px in Tailwind: text-xs
  color: colors.silver,
  backgroundColor: `${colors.teal}30`,  // teal at 30% -> rgba(47,64,77,0.19)
  border: `1px solid ${colors.teal}60`,  // teal at 60% -> rgba(47,64,77,0.38)
};

// Impact badge style
export const impactBadgeStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: colors.amber,
  backgroundColor: `${colors.amber}10`,
  padding: "3px 10px",
  borderRadius: "12px",
  border: `1px solid ${colors.amber}12`,
};
