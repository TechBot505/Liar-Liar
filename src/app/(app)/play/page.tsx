import { Suspense, type JSX } from "react";
import { PlayClient } from "@/components/home/PlayClient";

/** The main hub for players who already have a profile. */
export default function PlayPage(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <PlayClient />
    </Suspense>
  );
}
