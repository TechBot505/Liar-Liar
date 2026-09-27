import type { JSX } from "react";
import type { Metadata } from "next";
import { DecksClient } from "@/components/home/decks/DecksClient";

export const metadata: Metadata = {
  title: "Decks — Liar Liar",
  description: "Browse every Liar Liar deck, from fake facts to The Truth Comes Out, with sample prompts.",
};

export default function DecksPage(): JSX.Element {
  return <DecksClient />;
}
