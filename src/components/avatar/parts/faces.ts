import type { FaceId } from "@/lib/avatar";

/**
 * Face/body silhouettes on a 100×100 canvas, centered ~ (50,52). Original
 * chunky-blob shapes (Among-Us-meets-Fall-Guys energy) — each a single path
 * so it can carry the body fill + a thick ink outline.
 */
export const FACE_PATHS: Record<FaceId, string> = {
  egg: "M50 12 C72 12 82 34 82 56 C82 80 68 92 50 92 C32 92 18 80 18 56 C18 34 28 12 50 12 Z",
  bean: "M32 16 C56 6 84 22 82 48 C80 76 64 92 43 90 C22 88 14 64 18 44 C21 28 22 22 32 16 Z",
  round: "M50 14 C71 14 86 33 86 53 C86 76 70 90 50 90 C30 90 14 76 14 53 C14 33 29 14 50 14 Z",
  tall: "M50 8 C70 8 76 30 76 52 C76 82 66 94 50 94 C34 94 24 82 24 52 C24 30 30 8 50 8 Z",
  chubby: "M50 18 C79 18 88 40 86 60 C84 82 68 90 50 90 C32 90 16 82 14 60 C12 40 21 18 50 18 Z",
  drop: "M50 10 C64 30 80 44 80 62 C80 82 66 92 50 92 C34 92 20 82 20 62 C20 44 36 30 50 10 Z",
  square: "M28 20 H72 C80 20 84 24 84 34 V72 C84 82 80 86 70 86 H30 C20 86 16 82 16 72 V34 C16 24 20 20 28 20 Z",
  gem: "M50 10 L82 40 L64 90 H36 L18 40 Z",
};
