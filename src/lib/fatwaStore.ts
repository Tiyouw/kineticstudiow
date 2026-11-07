import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import type { Answer } from "./fatwaQuestions";

/** Server-only helpers for Fatwa's questionnaire (they use the write token). */
export const FATWA_DOC = "fatwaAnswers";

/** The link /q/<FATWA_Q_TOKEN> is the only key to the questionnaire. */
export const validToken = (t: unknown) => {
  const want = process.env.FATWA_Q_TOKEN;
  return !!want && typeof t === "string" && t === want;
};

const write = () =>
  createClient({ projectId, dataset, apiVersion, token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false, perspective: "raw" });

export async function readAnswers(): Promise<Record<string, Answer>> {
  const doc = await write().fetch<{ answers?: Record<string, Answer> } | null>(`*[_id == $id][0]{answers}`, { id: FATWA_DOC }, { cache: "no-store" });
  return doc?.answers ?? {};
}

export async function saveAnswer(key: string, a: Answer | null) {
  const c = write();
  await c.createIfNotExists({ _id: FATWA_DOC, _type: FATWA_DOC });
  const p = c.patch(FATWA_DOC).set({ updatedAt: new Date().toISOString() });
  await (a ? p.set({ [`answers.${key}`]: a }) : p.unset([`answers.${key}`])).commit();
}
