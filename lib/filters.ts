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
