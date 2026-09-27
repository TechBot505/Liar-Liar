"use client";

import type { JSX } from "react";
import { RoomError } from "./RoomError";

/** Shown when the host kicks the local player out of the room. */
export function KickedScreen(): JSX.Element {
  return (
    <RoomError
      emoji="👢"
      title="You were removed"
      message="The host kicked you from this room. No hard feelings — start or join another game."
    />
  );
}
