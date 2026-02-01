import axios from "axios";

/**
 * External APIs for real-time data
 * Free APIs for weather, sports scores, etc.
 */

/**
 * Get real-time weather data
 * Uses OpenWeatherMap free API (requires API key)
 * @param {string} city - City name
 * @returns {Object} Weather data
 */
export async function getWeather(city) {
  try {
    // Using wttr.in (free, no API key needed)
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      timeout: 10000,
    });

    if (response.data?.current_condition?.[0]) {
      const current = response.data.current_condition[0];
      const location = response.data.nearest_area[0];
      
      return {
        location: location.areaName[0].value,
        country: location.country[0].value,
        temperature: current.temp_C,
        feelsLike: current.FeelsLikeC,
        condition: current.weatherDesc[0].value,
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        windDirection: current.winddir16Point,
        visibility: current.visibility,
        pressure: current.pressure,
        uvIndex: current.uvIndex,
        time: current.localObsDateTime || new Date().toISOString(),
      };
    }
    throw new Error("Weather data not available");
  } catch (error) {
    console.error("Weather API error:", error.message);
    throw new Error(`Failed to fetch weather for ${city}`);
  }
}

/**
 * Get cricket match scores
 * Uses free cricket API
 * @param {string} team - Team name (optional)
 * @returns {Object} Match scores
 */
export async function getCricketScores(team = null) {
  try {
    // Using free cricket API
    const url = team 
      ? `https://cricapi.com/api/matches?apikey=${process.env.CRICKET_API_KEY || 'demo'}&team=${encodeURIComponent(team)}`
      : `https://cricapi.com/api/matches?apikey=${process.env.CRICKET_API_KEY || 'demo'}`;
    
    // Alternative: Use free API without key
    const response = await axios.get(
      `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY || 'demo'}&offset=0`,
      { timeout: 10000 }
    );

    if (response.data?.data && response.data.data.length > 0) {
      const matches = response.data.data.slice(0, 5); // Get top 5 matches
      return {
        matches: matches.map(match => ({
          name: match.name,
          status: match.status,
          venue: match.venue,
          date: match.date,
          teams: match.teams || [],
          score: match.score || [],
        })),
      };
    }
    
    // Fallback: Return sample data if API fails
    return {
      matches: [{
        name: "Live matches data temporarily unavailable",
        status: "Check back soon",
        message: "For real-time scores, please configure CRICKET_API_KEY in .env"
      }]
    };
  } catch (error) {
    console.error("Cricket API error:", error.message);
    // Return helpful message instead of error
    return {
      matches: [{
        name: "Cricket scores unavailable",
        message: "To enable cricket scores, add CRICKET_API_KEY to your .env file. Get free key from cricapi.com"
      }]
    };
  }
}

/**
 * Get football/soccer scores
 * Uses free football API
 * @param {string} league - League name (optional)
 * @returns {Object} Match scores
 */
export async function getFootballScores(league = null) {
  try {
    // Using free football API (football-data.org requires registration but has free tier)
    // Alternative: Use API-Football (rapidapi) free tier
    const apiKey = process.env.FOOTBALL_API_KEY;
    
    if (!apiKey) {
      // Return helpful message
      return {
        matches: [{
          message: "To get real-time football scores, add FOOTBALL_API_KEY to your .env file.",
          info: "Get free API key from: rapidapi.com/api-sports/api/api-football or football-data.org"
        }]
      };
    }

    // If API key is available, use it
    const response = await axios.get(
      `https://api.football-data.org/v4/matches`,
      {
        headers: { "X-Auth-Token": apiKey },
        timeout: 10000,
      }
    );

    if (response.data?.matches) {
      const matches = response.data.matches.slice(0, 10);
      return {
        matches: matches.map(match => ({
          homeTeam: match.homeTeam?.name,
          awayTeam: match.awayTeam?.name,
          score: match.score,
          status: match.status,
          competition: match.competition?.name,
          date: match.utcDate,
        })),
      };
    }

    return { matches: [] };
  } catch (error) {
    console.error("Football API error:", error.message);
    return {
      matches: [{
        message: "Football scores temporarily unavailable",
        info: "Configure FOOTBALL_API_KEY for real-time scores"
      }]
    };
  }
}

/**
 * Detect if user query needs real-time data
 * @param {string} prompt - User query
 * @returns {Object} Detected intent
 */
export function detectRealTimeIntent(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  const intents = {
    weather: /weather|temperature|rain|sunny|cloudy|humidity|forecast/i.test(lowerPrompt),
    cricket: /cricket|ipl|match score|cricket score|live cricket/i.test(lowerPrompt),
    football: /football|soccer|premier league|la liga|bundesliga|match score|football score/i.test(lowerPrompt),
    sports: /sports|score|match|live|game/i.test(lowerPrompt),
  };

  return intents;
}
