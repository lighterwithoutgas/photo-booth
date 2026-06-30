export type WorkflowState =
  | "landing"
  | "method"
  | "camera-permission"
  | "camera"
  | "upload"
  | "customize"
  | "printing"
  | "result"
  | "cutting"
  | "error";

export type FilterId = "original" | "vintage-bw" | "faded" | "warm" | "mono";
export type FrameId =
  | "cream"
  | "charcoal"
  | "red"
  | "pink"
  | "doodle"
  | "white"
  | "couple"
  | "friends"
  | "birthday"
  | "moonlit"
  | "botanical"
  | "cherry"
  | "loveletters"
  | "birthdaycheers"
  | "birthdaywish"
  | "weddingivory"
  | "weddingforest"
  | "graduation"
  | "tatreez"
  | "kuffiah";
export type BorderId = "ink" | "soft" | "none";

export interface PhotoPosition {
  x: number;
  y: number;
}

export interface PhotoItem {
  id: string;
  blob: Blob;
  url: string;
  name: string;
}

export interface StripOptions {
  filter: FilterId;
  frame: FrameId;
  border: BorderId;
  footerText: string;
  showDate: boolean;
  weddingNameOne: string;
  weddingNameTwo: string;
  photoPositions: PhotoPosition[];
}
