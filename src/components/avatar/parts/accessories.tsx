import type { JSX } from "react";
import type { AccessoryId } from "@/lib/avatar";

const INK = "#0A0A0B";
const ACCENT = "#FF5A4E";
const MUTED = "#A1A1AA";
const LIGHT = "#F5F5F4";

/** Accessories drawn on top of the pebble (hats/crowns sit above y≈22). Clean
 *  line icons in near-black with a single restrained accent per piece. */
export function Accessory({ id }: { id: AccessoryId }): JSX.Element | null {
  return ACCESSORIES[id] ?? null;
}

const ACCESSORIES: Record<AccessoryId, JSX.Element | null> = {
  none: null,
  glasses: (
    <g stroke={INK} strokeWidth={2.5} fill="none">
      <circle cx={38} cy={47} r={11} />
      <circle cx={62} cy={47} r={11} />
      <path d="M49 47 h2" />
      <path d="M27 44 l-6 -3 M73 44 l6 -3" strokeLinecap="round" />
    </g>
  ),
  shades: (
    <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M26 40 h20 a3 3 0 0 1 3 3 v3 a7 7 0 0 1 -13 3 l-8 -6z" fill={INK} />
      <path d="M74 40 h-20 a3 3 0 0 0 -3 3 v3 a7 7 0 0 0 13 3 l8 -6z" fill={INK} />
    </g>
  ),
  hat: (
    <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M28 22 L50 -2 L72 22 Z" fill={ACCENT} />
      <circle cx={50} cy={-2} r={4} fill={LIGHT} />
      <path d="M24 22 h52" strokeLinecap="round" />
    </g>
  ),
  crown: (
    <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M26 24 L30 4 L42 16 L50 0 L58 16 L70 4 L74 24 Z" fill={ACCENT} />
      <circle cx={50} cy={9} r={2.5} fill={LIGHT} stroke="none" />
    </g>
  ),
  headphones: (
    <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M20 50 V38 a30 26 0 0 1 60 0 V50" fill="none" />
      <rect x={14} y={46} width={12} height={20} rx={5} fill={MUTED} />
      <rect x={74} y={46} width={12} height={20} rx={5} fill={MUTED} />
    </g>
  ),
  bow: (
    <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M50 22 L34 14 L34 30 Z" fill={ACCENT} />
      <path d="M50 22 L66 14 L66 30 Z" fill={ACCENT} />
      <circle cx={50} cy={22} r={4} fill={LIGHT} />
    </g>
  ),
  antenna: (
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round">
      <path d="M40 18 Q36 2 30 0" fill="none" />
      <path d="M60 18 Q64 2 70 0" fill="none" />
      <circle cx={29} cy={0} r={4} fill={ACCENT} />
      <circle cx={71} cy={0} r={4} fill={ACCENT} />
    </g>
  ),
};
