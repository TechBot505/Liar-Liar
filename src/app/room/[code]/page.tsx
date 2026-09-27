import type { JSX } from "react";
import { notFound } from "next/navigation";
import { isValidCode, normalizeCode } from "@/game/codes";
import { RoomScreen } from "@/components/room/RoomScreen";

/**
 * Room route. Validates the 4-letter code on the server (404 on garbage) and
 * hands the normalized code to the client RoomScreen, which owns the socket.
 */
export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<JSX.Element> {
  const { code } = await params;
  const normalized = normalizeCode(code);
  if (!isValidCode(normalized)) notFound();
  return <RoomScreen code={normalized} />;
}
