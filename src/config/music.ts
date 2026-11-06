/**
 * ─────────────────────────────────────────────────────────────
 *  BACKGROUND MUSIC SETTINGS
 *
 *  1. Put your audio file in  public/music/   (mp3, m4a or wav)
 *  2. Set `file` below to its name, e.g. 'music/our-song.m4a'
 *  3. Rebuild / push. That's it.
 *
 *  If the file is missing (or `file` is null) the universe plays its own
 *  original, generated ambient soundtrack instead, so nothing ever breaks.
 *  Only use music you have the rights to publish on a public website.
 * ─────────────────────────────────────────────────────────────
 */
export const MUSIC = {
  /** Path relative to the /public folder. Set to null to always use the built-in ambient soundtrack. */
  file: 'music/background.mp3' as string | null,
  /** 0 – 1. Overall loudness of the background track. */
  volume: 0.6,
  /** Loop the track forever. */
  loop: true,
  /** How quiet the music gets (0 – 1 of normal) while an interactive sound plays. */
  duckLevel: 0.4,
  /** Seconds for the music to fade in after the first touch. */
  fadeInSeconds: 4,
  /** Play the built-in generated ambient soundtrack when no file is available. */
  ambientFallback: true,
};
