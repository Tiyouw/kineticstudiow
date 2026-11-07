import { NextResponse, type NextRequest } from "next/server";
import { QUESTION_KEYS, isAnswered, type Answer } from "@/lib/fatwaQuestions";
import { saveAnswer, validToken } from "@/lib/fatwaStore";

/** Autosave for Fatwa's questionnaire: one answer per request. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { token?: string; key?: string; answer?: Answer } | null;
  if (!body || !validToken(body.token)) return NextResponse.json({ ok: false }, { status: 404 });
  const { key, answer } = body;
  if (!key || !QUESTION_KEYS.has(key)) return NextResponse.json({ ok: false, error: "unknown question" }, { status: 400 });

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const clean: Answer = {};
  if (Array.isArray(answer?.picks)) clean.picks = answer.picks.filter((x): x is string => typeof x === "string").slice(0, 20).map((x) => x.slice(0, 200));
  const other = str(answer?.other, 2000);
  const text = str(answer?.text, 4000);
  if (other) clean.other = other;
  if (text) clean.text = text;

  await saveAnswer(key, isAnswered(clean) ? clean : null);
  return NextResponse.json({ ok: true });
}
