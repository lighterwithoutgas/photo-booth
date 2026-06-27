import type { FilterId } from "@/types/photo";

export interface FilterDefinition {
  id: FilterId;
  name: string;
  canvas: string;
  description: string;
}

export const FILTERS: FilterDefinition[] = [
  { id: "original", name: "True color", canvas: "none", description: "Natural, unfiltered color" },
  { id: "vintage-bw", name: "Silver print", canvas: "grayscale(1) sepia(.12) contrast(.92) brightness(1.05)", description: "Soft vintage black and white" },
  { id: "faded", name: "Sun faded", canvas: "saturate(.68) contrast(.88) brightness(1.08) sepia(.08)", description: "Soft faded color" },
  { id: "warm", name: "Warm film", canvas: "sepia(.2) saturate(1.08) contrast(.96) brightness(1.02)", description: "Warm analog color" },
  { id: "mono", name: "Newsprint", canvas: "grayscale(1) contrast(1.42) brightness(.95)", description: "High-contrast monochrome" },
];

export function getFilter(id: FilterId): FilterDefinition {
  return FILTERS.find((filter) => filter.id === id) ?? FILTERS[0];
}

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

export function transformPixel(id: FilterId, red: number, green: number, blue: number): [number, number, number] {
  if (id === "original") return [red, green, blue];
  const luminance = red * 0.299 + green * 0.587 + blue * 0.114;

  if (id === "vintage-bw") {
    const silver = ((luminance - 128) * 0.92 + 128) * 1.05;
    return [clamp(silver * 1.04 + 4), clamp(silver * 1.01 + 2), clamp(silver * 0.91)];
  }

  if (id === "faded") {
    const fade = (channel: number) => ((luminance + (channel - luminance) * 0.68 - 128) * 0.88 + 128) * 1.08;
    return [clamp(fade(red) + 6), clamp(fade(green) + 2), clamp(fade(blue) - 3)];
  }

  if (id === "warm") {
    return [clamp(red * 1.08 + 12), clamp(green * 1.02 + 4), clamp(blue * 0.88)];
  }

  const newsprint = ((luminance - 128) * 1.42 + 128) * 0.95;
  const value = clamp(newsprint);
  return [value, value, value];
}

export function applyFilterToImageData(imageData: ImageData, id: FilterId): ImageData {
  if (id === "original") return imageData;
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    const [red, green, blue] = transformPixel(id, data[index], data[index + 1], data[index + 2]);
    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
  }
  return imageData;
}
