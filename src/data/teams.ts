import type { Team } from "@/types";

export const teams: Team[] = Array.from({ length: 12 }, (_, index) => ({
  id: `team-${index + 1}`,
  name: `Team ${index + 1}`,
}));
