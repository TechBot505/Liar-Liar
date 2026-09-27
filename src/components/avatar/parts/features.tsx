import type { JSX } from "react";
import type { EyesId, MouthId } from "@/lib/avatar";

const INK = "#0A0A0B";
const WHITE = "#F5F5F4";

/** Eye renderers. Left eye ~x37, right ~x63, baseline y≈48. */
export function Eyes({ id }: { id: EyesId }): JSX.Element {
  const eye = EYES[id] ?? EYES.wide;
  return <g stroke={INK} strokeWidth={2.5} strokeLinecap="round">{eye}</g>;
}

const EYES: Record<EyesId, JSX.Element> = {
  dot: (
    <>
      <circle cx={38} cy={48} r={4.5} fill={INK} stroke="none" />
      <circle cx={62} cy={48} r={4.5} fill={INK} stroke="none" />
    </>
  ),
  wide: (
    <>
      <circle cx={38} cy={47} r={9} fill={WHITE} />
      <circle cx={62} cy={47} r={9} fill={WHITE} />
      <circle cx={40} cy={48} r={4} fill={INK} stroke="none" />
      <circle cx={64} cy={48} r={4} fill={INK} stroke="none" />
    </>
  ),
  sleepy: (
    <>
      <path d="M31 48 a7 7 0 0 1 14 0" fill={WHITE} />
      <path d="M55 48 a7 7 0 0 1 14 0" fill={WHITE} />
    </>
  ),
  wink: (
    <>
      <circle cx={38} cy={47} r={8} fill={WHITE} />
      <circle cx={39} cy={48} r={3.5} fill={INK} stroke="none" />
      <path d="M55 48 h14" fill="none" />
    </>
  ),
  happy: (
    <>
      <path d="M31 50 q7 -10 14 0" fill="none" />
      <path d="M55 50 q7 -10 14 0" fill="none" />
    </>
  ),
  shifty: (
    <>
      <circle cx={38} cy={47} r={8} fill={WHITE} />
      <circle cx={62} cy={47} r={8} fill={WHITE} />
      <circle cx={42} cy={48} r={3.5} fill={INK} stroke="none" />
      <circle cx={66} cy={48} r={3.5} fill={INK} stroke="none" />
    </>
  ),
  star: (
    <>
      <path d="M38 40 l2 5 6 .5 -4.5 4 1.5 6 -5-3.2 -5 3.2 1.5-6 -4.5-4 6-.5z" fill={INK} stroke="none" />
      <path d="M62 40 l2 5 6 .5 -4.5 4 1.5 6 -5-3.2 -5 3.2 1.5-6 -4.5-4 6-.5z" fill={INK} stroke="none" />
    </>
  ),
  line: (
    <>
      <path d="M32 48 h12" fill="none" />
      <path d="M56 48 h12" fill="none" />
    </>
  ),
};

/** Mouth renderers, centered ~x50, y≈68. */
export function Mouth({ id }: { id: MouthId }): JSX.Element {
  const m = MOUTHS[id] ?? MOUTHS.smile;
  return <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">{m}</g>;
}

const MOUTHS: Record<MouthId, JSX.Element> = {
  smile: <path d="M38 66 q12 12 24 0" fill="none" />,
  grin: <path d="M36 64 q14 16 28 0 q-14 6 -28 0z" fill={INK} />,
  smirk: <path d="M40 68 q12 6 22 -2" fill="none" />,
  oh: <ellipse cx={50} cy={69} rx={7} ry={9} fill={INK} />,
  flat: <path d="M40 68 h20" fill="none" />,
  tongue: (
    <>
      <path d="M37 65 q13 14 26 0 q-13 6 -26 0z" fill={INK} />
      <path d="M46 70 q4 8 8 0z" fill="#C08B99" stroke="none" />
    </>
  ),
  teeth: (
    <>
      <rect x={38} y={63} width={24} height={12} rx={4} fill={WHITE} />
      <path d="M50 63 v12 M44 63 v12 M56 63 v12" strokeWidth={2} />
    </>
  ),
  frown: <path d="M38 72 q12 -12 24 0" fill="none" />,
};
