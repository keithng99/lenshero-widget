/**
 * Miscellaneous utility functions for the LensHero widget
 */

export function getStoreDomain() {
  const origin = window.location.origin;
  const hostname = new URL(origin).hostname;
  const cleanHost = hostname.replace(/^www\./, "");
  const storeName = cleanHost.split("/")[0];
  return storeName;
}
