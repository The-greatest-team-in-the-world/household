import { ChoreCompletion } from "@/types/chore-completion";
import { atom } from "jotai";

export const choreCompletion = atom<ChoreCompletion | null>(null);
export const choreCompletions = atom<ChoreCompletion[]>([]);
