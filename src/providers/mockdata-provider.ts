import { db } from "@/data/mock-db";
import { atom } from "jotai";

export const mockdataAtom = atom(db);
