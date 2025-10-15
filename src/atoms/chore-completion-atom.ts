import { ChoreCompletion } from "@/types/chore-completion";
import { atom } from "jotai";

export const choreCompletionsAtom = atom<ChoreCompletion[]>([]);
