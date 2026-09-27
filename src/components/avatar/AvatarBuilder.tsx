"use client";

import { useState, type JSX } from "react";
import { motion } from "motion/react";
import { Dices } from "lucide-react";
import { AVATAR_PARTS, randomAvatar, type AvatarConfig } from "@/lib/avatar";
import { Segmented, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { playSound } from "@/lib/sound";
import { Avatar } from "./Avatar";

export interface AvatarBuilderProps {
  value: AvatarConfig;
  onChange: (next: AvatarConfig) => void;
}

type PartKey = (typeof AVATAR_PARTS)[number]["key"];

/** Compact tab labels so all six categories fit a 320px-wide segmented row. */
const SHORT_LABELS: Partial<Record<PartKey, string>> = { accessory: "Extra", bg: "Bg" };
const TABS = AVATAR_PARTS.map((p) => ({ value: p.key, label: SHORT_LABELS[p.key] ?? p.label }));

/** Avatar editor: bobbing preview + shuffle, Segmented category tabs, tile grid. */
export function AvatarBuilder({ value, onChange }: AvatarBuilderProps): JSX.Element {
  const [spin, setSpin] = useState(0);
  const [active, setActive] = useState<PartKey>("face");
  const part = AVATAR_PARTS.find((p) => p.key === active) ?? AVATAR_PARTS[0];

  const set = (opt: string) => {
    haptic("select");
    playSound("tap");
    onChange({ ...value, [active]: opt } as AvatarConfig);
  };

  const randomize = () => {
    haptic("success");
    playSound("submit");
    setSpin((s) => s + 360);
    onChange(randomAvatar());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <Avatar config={value} size={112} ring bob />
        <motion.div animate={{ rotate: spin }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <IconButton label="Shuffle avatar" onClick={randomize}>
            <Dices size={22} aria-hidden />
          </IconButton>
        </motion.div>
      </div>

      <Segmented options={TABS} value={active} onChange={setActive} label="Avatar part" />

      <div className="grid grid-cols-4 gap-2">
        {part.options.map((opt) => {
          const selected = value[part.key] === opt;
          return (
            <motion.button
              key={String(opt)}
              type="button"
              aria-label={`${part.label} ${opt}`}
              aria-pressed={selected}
              whileTap={{ scale: 0.92 }}
              onClick={() => set(String(opt))}
              className={cn(
                "no-tap-highlight flex items-center justify-center rounded-(--radius-input) border p-1 transition-colors",
                selected ? "border-accent ring-1 ring-accent" : "border-line hover:bg-surface-2",
              )}
            >
              <Avatar
                config={{ ...value, [part.key]: opt } as AvatarConfig}
                size={52}
                className="rounded-[10px]"
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
