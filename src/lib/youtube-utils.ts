
// Includes regexp for a timestamp and common "subscribe" or "guest" phrases
const DESCRIPTION_SPLIT_REGEX = /(?:Subscribe|Guest Speakers|\b\d{1,2}:\d{2}(?::\d{2})?\b)+/i;

export function getMainDescription(fullDescription: string | null | undefined): string {
  if (!fullDescription) {
    return "No description available.";
  }
  // Split the description by the regex, take the first part.
  const parts = fullDescription.split(DESCRIPTION_SPLIT_REGEX);
  const mainPart = parts[0]?.trim();

  if (mainPart && mainPart.length > 10) { // Ensure the part is somewhat substantial
    return mainPart;
  }
  // Fallback: return a snippet of the original if split result is too short or if no split occurred
  return fullDescription.length > 200 ? fullDescription.substring(0, 200) + "..." : fullDescription;
}

export function parseISO8601Duration(duration: string | null | undefined): string {
  if (!duration) return "0:00";

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${hours}:`;
    formattedTime += `${minutes.toString().padStart(2, '0')}:`;
    formattedTime += seconds.toString().padStart(2, '0');
  } else {
    formattedTime += `${minutes}:`;
    formattedTime += seconds.toString().padStart(2, '0');
  }

  return formattedTime;
}
