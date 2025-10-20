import { atom } from 'jotai';

export const slideVisibleAtom = atom<boolean>(false);

export const shouldRenderSlideAtom = atom<boolean>(false);