import { heuristicsArt } from './heuristics';
import type { Illustration } from './kit';
import { lawsArt } from './laws';
import { platformsArt, platformTrackArt } from './platforms';
import { trackArt } from './tracks';
import { wcagArt, wcagTrackArt } from './wcag';

export { toSvg, type Illustration } from './kit';

export const illustrations: Record<string, Illustration> = {
  ...heuristicsArt,
  ...lawsArt,
  ...platformsArt,
  ...wcagArt,
  ...trackArt,
  ...platformTrackArt,
  ...wcagTrackArt,
};
