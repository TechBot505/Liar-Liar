import type { JSX } from "react";
import type { Metadata } from "next";
import { HowToPlayClient } from "@/components/home/howto/HowToPlayClient";

export const metadata: Metadata = {
  title: "How to play — Liar Liar",
  description: "Learn the rules: write a convincing lie, spot the truth, and fool your friends for points.",
};

export default function HowToPlayPage(): JSX.Element {
  return <HowToPlayClient />;
}
