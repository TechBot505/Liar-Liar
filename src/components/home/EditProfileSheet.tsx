"use client";

import { useEffect, useState, type JSX } from "react";
import { Button, Input, Sheet } from "@/components/ui";
import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import type { AvatarConfig } from "@/lib/avatar";
import { useProfileStore } from "@/lib/store/profile";
import { checkName } from "./names";

export interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Bottom sheet to tweak the saved avatar + name. */
export function EditProfileSheet({ open, onClose }: EditProfileSheetProps): JSX.Element {
  const profile = useProfileStore((s) => s.profile);
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState<AvatarConfig | null>(profile?.avatar ?? null);
  const [touched, setTouched] = useState(false);

  // Re-sync local editor state whenever the sheet (re)opens.
  useEffect(() => {
    if (open && profile) {
      setName(profile.name);
      setAvatar(profile.avatar);
      setTouched(false);
    }
  }, [open, profile]);

  const check = checkName(name);

  const save = () => {
    setTouched(true);
    if (!check.ok || !avatar) return;
    setIdentity(name.trim(), avatar);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Edit your look">
      {avatar && (
        <div className="flex flex-col gap-4">
          <AvatarBuilder value={avatar} onChange={setAvatar} />
          <Input
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            counter
            error={touched && !check.ok ? check.error : undefined}
          />
          <Button size="lg" fullWidth onClick={save}>
            Save
          </Button>
        </div>
      )}
    </Sheet>
  );
}
