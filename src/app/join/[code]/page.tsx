import type { JSX } from "react";
import { JoinClient } from "@/components/home/JoinClient";

/** Deep link: /join/ABCD. Params resolve async in Next 15. */
export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<JSX.Element> {
  const { code } = await params;
  return <JoinClient code={code} />;
}
