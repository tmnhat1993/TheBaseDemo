/** Scale GSAP durations / delays — 15% faster scene & UI motion */
export const MOTION_SPEED = 0.85;

export function dur(seconds) {
  return seconds * MOTION_SPEED;
}

export function durMs(ms) {
  return Math.round(ms * MOTION_SPEED);
}
