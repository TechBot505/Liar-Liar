import type { JSX } from "react";
import { HistoryDetail } from "@/components/history/HistoryDetail";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  return <HistoryDetail id={id} />;
}
