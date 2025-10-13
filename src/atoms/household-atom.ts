import { Household } from "@/types/household";
import { atom } from "jotai";

export const currentHouseholdAtom = atom<Household | null>(null);
