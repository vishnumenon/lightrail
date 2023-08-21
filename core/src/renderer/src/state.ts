import { atom } from "recoil";
import type { LightrailView } from "lightrail-sdk";

export const viewAtom = atom<LightrailView>({
  key: "viewState",
  default: "prompt",
});

export const promptHistoryAtom = atom<any[]>({
  key: "promptHistoryState",
  default: [],
});
