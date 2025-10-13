import { HouseholdMember } from "@/types/household-member";
import { atom } from "jotai";

export const currentHouseholdMember = atom<HouseholdMember | null>(null);
