import { http } from "./http.js";
import { cached } from "../../../shared/utils/cache.js";

/** Indian markets, currencies and crypto — all key-less public feeds. */
const MARKETS_TTL_MS = 30e3;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const num = (v) => (v === undefined || v === null || v === "" ? null : Number(String(v).replace(/,/g, "")));
const quote = (id, name, price, change, percent, extra = {}) => ({
  id, name, price: num(price), change: num(change), percent: num(percent), ...extra,
});

// NSE: Nifty 50, Bank Nifty, sector indices, India VIX
const NSE_PICK = [
  ["NIFTY 50", "Nifty 50"],
  ["NIFTY BANK", "Bank Nifty"],
  ["NIFTY IT", "Nifty IT"],
  ["NIFTY FIN SERVICE", "Nifty Fin Service"],
  ["NIFTY MIDCAP 100", "Nifty Midcap 100"],
  ["INDIA VIX", "India VIX"],
];
async function nseIndices() {
  const { data } = await http.get("https://www.nseindia.com/api/allIndices", {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/json", Referer: "https://www.nseindia.com/" },
  });
  const rows = data?.data || [];
  return NSE_PICK.flatMap(([key, name]) => {
    const r = rows.find((x) => x.index === key);
    return r
      ? [quote(key, name, r.last, r.variation, r.percentChange, {
          open: num(r.open), high: num(r.high), low: num(r.low), prevClose: num(r.previousClose),
          year: { high: num(r.yearHigh), low: num(r.yearLow) },
        })]
      : [];
  });
}

// BSE blocks scripted access, Moneycontrol's price feed exposes the Sensex
async function sensex() {
  const { data } = await http.get(
    "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BSEN",
    { headers: { "User-Agent": BROWSER_UA } }
  );
  const d = data?.data;
  if (!d?.pricecurrent) throw new Error("Sensex unavailable");
  return quote("SENSEX", "Sensex", d.pricecurrent, d.pricechange, d.pricepercentchange, {
    open: num(d.OPEN), high: num(d.HIGH), low: num(d.LOW),
  });
}

async function currencies() {
  const { data } = await http.get("https://open.er-api.com/v6/latest/USD");
  const r = data.rates;
  const inr = (code) => Math.round((r.INR / r[code]) * 100) / 100;
  return [
    quote("USDINR", "US Dollar", inr("USD"), null, null, { unit: "₹" }),
    quote("EURINR", "Euro", inr("EUR"), null, null, { unit: "₹" }),
    quote("GBPINR", "British Pound", inr("GBP"), null, null, { unit: "₹" }),
    quote("AEDINR", "UAE Dirham", inr("AED"), null, null, { unit: "₹" }),
  ];
}

async function crypto() {
  const { data } = await http.get("https://api.coingecko.com/api/v3/simple/price", {
    params: { ids: "bitcoin,ethereum,solana", vs_currencies: "inr", include_24hr_change: true },
  });
  const row = (id, key, name) =>
    quote(key, name, data[id].inr, null, data[id].inr_24h_change, { unit: "₹" });
  return [row("bitcoin", "BTC", "Bitcoin"), row("ethereum", "ETH", "Ethereum"), row("solana", "SOL", "Solana")];
}

/** NSE trades Mon–Fri 09:15–15:30 IST (public holidays are not tracked). */
export function indiaMarketStatus(now = new Date()) {
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const weekday = ist.getDay() >= 1 && ist.getDay() <= 5;
  const open = weekday && mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
  return { open, label: open ? "Market open" : weekday ? "Market closed" : "Weekend" };
}

export const getMarkets = () =>
  cached("markets", MARKETS_TTL_MS, async () => {
    const [idx, sx, fx, cr] = await Promise.allSettled([nseIndices(), sensex(), currencies(), crypto()]);
    const ok = (r) => (r.status === "fulfilled" ? r.value : []);
    // Sensex goes right after Nifty 50 for the headline cards
    const indices = ok(idx);
    if (sx.status === "fulfilled") indices.splice(Math.min(1, indices.length), 0, sx.value);
    const result = { indices, currencies: ok(fx), crypto: ok(cr), market: indiaMarketStatus(), updatedAt: new Date().toISOString() };
    if (!indices.length && !result.currencies.length && !result.crypto.length) {
      throw new Error("Market data is unavailable right now");
    }
    return result;
  });
