import { http } from "./http.js";
import { cached } from "../../../shared/utils/cache.js";

/** ESPN public scoreboard feeds (cricket, football, basketball) — free and key-less. */
const SCORES_TTL_MS = 30e3;
const MAX_CRICKET_MATCHES = 40;
const MAX_FOOTBALL_MATCHES = 40;
const MAX_BASKETBALL_MATCHES = 30;

const FOOTBALL_LEAGUES = [
  "eng.1", "esp.1", "ger.1", "ita.1", "fra.1", "uefa.champions", "uefa.europa", "ind.1",
];

const shape = (e, league) => {
  const comp = e.competitions?.[0] || e;
  const type = e.status?.type || e.fullStatus?.type || {};
  return {
    id: String(e.id ?? e.uid ?? `${league}-${e.name}`),
    league,
    name: e.name,
    date: e.date,
    state: type.state || e.status || "pre", // pre | in | post
    status: type.shortDetail || type.detail || e.summary || "",
    summary: e.fullStatus?.longSummary || e.fullStatus?.summary || "",
    venue: e.location || comp.venue?.fullName || "",
    link: e.link || e.links?.[0]?.href || "",
    teams: (comp.competitors || e.competitors || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((t) => ({
        name: t.team?.displayName || t.displayName,
        abbr: t.team?.abbreviation || t.abbreviation,
        logo: t.team?.logo || "",
        score: t.score ?? "",
        winner: Boolean(t.winner),
      })),
  };
};

// live first, then upcoming (soonest), then results (latest)
const ORDER = { in: 0, pre: 1, post: 2 };
const sortMatches = (list) =>
  list.sort(
    (a, b) =>
      (ORDER[a.state] ?? 3) - (ORDER[b.state] ?? 3) ||
      (a.state === "post" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date))
  );

async function espnScoreboard(path, league) {
  const { data } = await http.get(`https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`);
  const name = data.leagues?.[0]?.name || league;
  return (data.events || []).map((e) => shape(e, name));
}

export const getCricketScores = () =>
  cached("cricket", SCORES_TTL_MS, async () => {
    const { data } = await http.get(
      "https://site.web.api.espn.com/apis/personalized/v2/scoreboard/header",
      { params: { sport: "cricket", lang: "en", region: "in" } }
    );
    const matches = (data.sports?.[0]?.leagues || []).flatMap((l) =>
      (l.events || []).map((e) => shape(e, l.name))
    );
    return sortMatches(matches).slice(0, MAX_CRICKET_MATCHES);
  });

export const getFootballScores = () =>
  cached("football", SCORES_TTL_MS, async () => {
    const results = await Promise.allSettled(
      FOOTBALL_LEAGUES.map((l) => espnScoreboard(`soccer/${l}`, l))
    );
    const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    return sortMatches(all).slice(0, MAX_FOOTBALL_MATCHES);
  });

export const getBasketballScores = () =>
  cached("basketball", SCORES_TTL_MS, async () =>
    sortMatches(await espnScoreboard("basketball/nba", "NBA")).slice(0, MAX_BASKETBALL_MATCHES)
  );

export const SPORTS = {
  cricket: getCricketScores,
  football: getFootballScores,
  basketball: getBasketballScores,
};

