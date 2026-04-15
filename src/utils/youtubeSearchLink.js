export function buildYouTubeSearchUrl(title, artist) {
  const query = `${title} ${artist}`;
  const encoded = encodeURIComponent(query);
  return `https://www.youtube.com/results?search_query=${encoded}`;
}