/** Default city when a weather question names none. */
export const DEFAULT_CITY = "Delhi";
/** Max matches included in an AI prompt. */
export const PROMPT_MATCH_LIMIT = 12;

/**
 * Pull a city out of a weather question.
 *  "weather in Mumbai today?"  -> Mumbai
 *  "Pune weather"              -> Pune
 */
export function extractCity(prompt, fallback = DEFAULT_CITY) {
  const after = prompt.match(
    /\b(?:in|at|for|of)\s+([A-Za-z][A-Za-z .'-]{1,30}?)(?=\s+(?:today|tonight|now|tomorrow|right|currently|please|weather|temperature)\b|[?.!,]|$)/i
  );
  if (after) return after[1].trim();
  const before = prompt.match(
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:weather|temperature|forecast)\b/
  );
  return before ? before[1].trim() : fallback;
}

/** Which kind of live data (if any) does this prompt need? */
export function detectRealTimeIntent(prompt) {
  return {
    weather: /\b(weather|temperature|forecast|humidity|rain(ing)?|sunny|cloudy|mausam|barish)\b/i.test(prompt),
    cricket: /\b(cricket|ipl|odi|t20|test match|ranji|bbl|world cup)\b/i.test(prompt),
    football: /\b(football|soccer|premier league|la liga|bundesliga|serie a|champions league|epl|isl)\b/i.test(prompt),
    basketball: /\b(nba|basketball)\b/i.test(prompt),
    aqi: /\b(aqi|air quality|pollution|pm ?2\.?5|smog)\b/i.test(prompt),
    markets: /\b(nifty|sensex|bank ?nifty|stock market|share market|stocks?|bitcoin|btc|ethereum|crypto|dollar|usd|rupee|inr|exchange rate)\b/i.test(prompt),
  };
}

/** Trim a match list into something small the model can read. */
export const summariseMatches = (matches, limit = PROMPT_MATCH_LIMIT) =>
  matches.slice(0, limit).map((m) => ({
    league: m.league,
    match: m.teams.map((t) => `${t.name}${t.score ? " " + t.score : ""}`).join(" vs "),
    status: m.state === "in" ? `LIVE – ${m.status}` : m.summary || m.status,
    venue: m.venue,
    startsAt: m.date,
  }));
