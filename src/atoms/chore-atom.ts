import { Chore } from "@/types/chore";
import { atom } from "jotai";

export const choreAtom = atom<Chore | null>(null);
export const choresAtom = atom<Chore[]>([]);
