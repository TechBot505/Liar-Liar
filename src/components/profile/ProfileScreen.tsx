"use client";

import { useState, type JSX } from "react";
import { Pencil } from "lucide-react";
import { Avatar } from "@/components/avatar/Avatar";
import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import { Button, Card, Input, Sheet, Stat, Sticker, Toggle, toast } from "@/components/ui";
import { PageTitle } from "@/components/shell/PageTitle";
import { isAuthEnabledClient } from "@/lib/env";
import { randomAvatar, type AvatarConfig } from "@/lib/avatar";
import { useHydrated, usePrefsStore, useProfileStore, useHistoryStore } from "@/lib/store";
import { ProfileAccount } from "./ProfileAccount";
import { useProfileStats } from "./useProfileStats";
import { useCloudStats } from "./useCloudStats";
import { awardMeta } from "@/components/room/final/awardMeta";

export function ProfileScreen(): JSX.Element {
  const hydrated = useHydrated();
  const profile = useProfileStore((s) => s.profile);
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const prefs = usePrefsStore();
  const localStats = useProfileStats();
  const cloudStats = useCloudStats();
  // When signed in with cloud persistence, headline stats come from the account
  // (synced across devices); otherwise fall back to local, device-only stats.
  const stats = cloudStats ?? localStats;

  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(() => randomAvatar());

  const openEdit = (): void => {
    setName(profile?.name ?? "");
    setAvatar(profile?.avatar ?? randomAvatar());
    setEdit(true);
  };

  const save = (): void => {
    setIdentity(name.trim() || "Player", avatar);
    setEdit(false);
    if (isAuthEnabledClient) {
      void fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Player", avatar }),
      }).catch(() => undefined);
    }
    toast("Profile saved!", "success");
  };

  const reset = (): void => {
    useHistoryStore.getState().clear();
    setIdentity("", randomAvatar());
    setConfirm(false);
    toast("Profile reset", "info");
  };

  if (!hydrated) return <div className="grid place-items-center py-20 text-fg-muted">Loading…</div>;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle eyebrow="You">Profile</PageTitle>

      <section className="flex items-center gap-4">
        <Avatar config={profile?.avatar ?? randomAvatar("me")} size={72} ring />
        <div className="min-w-0 flex-1">
          <p className="truncate text-display text-xl text-fg">{profile?.name || "Nameless liar"}</p>
          <button onClick={openEdit} className="mt-0.5 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-fg">
            <Pencil size={14} /> Edit avatar & name
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Games" value={stats.games} />
        <Stat label="Wins" value={stats.wins} accent={stats.wins > 0} />
        <Stat label="Win rate" value={stats.winRate} suffix="%" />
        <Stat label="Avg rank" value={stats.avgRank || "—"} />
      </section>

      {localStats.badges.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-fg-faint">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {localStats.badges.map((b) => (
              <Sticker key={b.id} tone="accent">
                {awardMeta(b.id).emoji} {b.label}{b.count > 1 ? ` ×${b.count}` : ""}
              </Sticker>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-fg-faint">Preferences</h2>
        <Card className="flex items-center justify-between">
          <span className="text-sm text-fg">Sound</span>
          <Toggle checked={prefs.sound} onChange={prefs.setSound} label="Sound" hideLabel />
        </Card>
        <Card className="flex items-center justify-between">
          <span className="text-sm text-fg">Haptics</span>
          <Toggle checked={prefs.haptics} onChange={prefs.setHaptics} label="Haptics" hideLabel />
        </Card>
      </section>

      {isAuthEnabledClient ? (
        <ProfileAccount />
      ) : (
        <Card className="text-sm text-fg-muted">
          Accounts aren&apos;t enabled — your history lives on this device.
        </Card>
      )}

      <Button variant="danger-outline" fullWidth onClick={() => setConfirm(true)}>
        Reset profile
      </Button>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Edit your look">
        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} maxLength={16} counter onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <AvatarBuilder value={avatar} onChange={setAvatar} />
          <Button fullWidth size="lg" onClick={save}>Save</Button>
        </div>
      </Sheet>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Reset profile?">
        <p className="mb-4 text-sm text-fg-muted">
          This clears your local history and starts a fresh avatar. This can&apos;t be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setConfirm(false)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={reset}>Reset</Button>
        </div>
      </Sheet>
    </div>
  );
}
