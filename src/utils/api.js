/**
 * API utility functions for the LensHero widget
 */

/**
 * Get authentication token for widget API calls
 * @returns {Promise<string>} The access token
 */
export async function getWidgetToken() {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await fetch(
    `${API_ENDPOINT}/authentication/lenshero-widget-token?timestamp=${timestamp}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get widget token: ${response.status}`);
  }

  const data = await response.json();

  return data.access_token;
}
