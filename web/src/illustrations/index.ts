import { figmaArt, figmaTrackArt } from './figma';
import { heuristicsArt } from './heuristics';
import type { Illustration } from './kit';
import { lawsArt } from './laws';
import { platformsArt, platformTrackArt } from './platforms';
import { prototypingArt, prototypingTrackArt } from './prototyping';
import { researchArt, researchTrackArt } from './research';
import { systemsArt, systemsTrackArt } from './systems';
import { trackArt } from './tracks';
import { visualArt, visualTrackArt } from './visual';
import { wcagArt, wcagTrackArt } from './wcag';
import { writingArt, writingTrackArt } from './writing';

export { toSvg, type Illustration } from './kit';

export const illustrations: Record<string, Illustration> = {
  ...heuristicsArt,
  ...lawsArt,
  ...platformsArt,
  ...wcagArt,
  ...systemsArt,
  ...writingArt,
  ...researchArt,
  ...figmaArt,
  ...visualArt,
  ...prototypingArt,
  ...trackArt,
  ...platformTrackArt,
  ...wcagTrackArt,
  ...systemsTrackArt,
  ...writingTrackArt,
  ...researchTrackArt,
  ...figmaTrackArt,
  ...visualTrackArt,
  ...prototypingTrackArt,
};
