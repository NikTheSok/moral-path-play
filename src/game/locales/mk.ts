/* Macedonian translations, keyed by the exact English source string.
 * Missing keys simply fall back to English. */
import { MK_UI } from "./mk.ui";
import { MK_STORY } from "./mk.story";
import { MK_ECHO } from "./mk.echo";

export const MK: Record<string, string> = {
  ...MK_UI,
  ...MK_STORY,
  ...MK_ECHO,
};
