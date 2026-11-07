import { notFound } from "next/navigation";
import { readAnswers, validToken } from "@/lib/fatwaStore";
import Questionnaire from "./Questionnaire";

export const dynamic = "force-dynamic";

export default async function QPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!validToken(token)) notFound();
  const initial = await readAnswers();
  return <Questionnaire token={token} initial={initial} />;
}
