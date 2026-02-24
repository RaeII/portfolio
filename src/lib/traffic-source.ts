type TrafficSourceData = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  channel: string;
  referrerHost: string;
  landingPath: string;
  clickId: string;
  timestamp: string;
};

type GtagCommand = (
  command: "event",
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
) => void;

declare global {
  interface Window {
    gtag?: GtagCommand;
  }
}

const SESSION_STORAGE_KEY = "traffic_source_v1";
const EVENT_SENT_KEY = "traffic_source_event_sent_v1";

function getChannel(source: string, medium: string, referrerHost: string, clickId: string): string {
  const normalizedSource = source.toLowerCase();
  const normalizedMedium = medium.toLowerCase();
  const normalizedReferrer = referrerHost.toLowerCase();

  if (normalizedMedium) {
    if (/(cpc|ppc|paid|display|affiliate|sponsored)/.test(normalizedMedium)) return "paid";
    if (/social/.test(normalizedMedium)) return "social";
    if (/email/.test(normalizedMedium)) return "email";
    if (/organic/.test(normalizedMedium)) return "organic_search";
  }

  if (clickId) return "paid";

  if (!normalizedReferrer) return "direct";

  if (/(google|bing|duckduckgo|yahoo|baidu|yandex)\./.test(normalizedReferrer)) return "organic_search";
  if (
    /(facebook|instagram|tiktok|linkedin|x\.com|twitter|youtube|pinterest|reddit|whatsapp)\./.test(
      normalizedReferrer
    )
  ) {
    return "social";
  }

  if (normalizedSource && normalizedSource !== "(direct)") return "campaign";

  return "referral";
}

function getFromSessionStorage(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setInSessionStorage(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignora bloqueios de storage no navegador.
  }
}

function resolveTrafficSource(): TrafficSourceData {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const utmSource = params.get("utm_source")?.trim() || "";
  const utmMedium = params.get("utm_medium")?.trim() || "";
  const utmCampaign = params.get("utm_campaign")?.trim() || "";
  const utmTerm = params.get("utm_term")?.trim() || "";
  const utmContent = params.get("utm_content")?.trim() || "";
  const clickId =
    params.get("gclid")?.trim() || params.get("fbclid")?.trim() || params.get("msclkid")?.trim() || "";

  const referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
  const source = utmSource || (referrerHost ? referrerHost : "(direct)");
  const medium = utmMedium || (referrerHost ? "referral" : "(none)");
  const channel = getChannel(source, medium, referrerHost, clickId);

  return {
    source,
    medium,
    campaign: utmCampaign || "(not set)",
    term: utmTerm || "(not set)",
    content: utmContent || "(not set)",
    channel,
    referrerHost: referrerHost || "(none)",
    landingPath: `${url.pathname}${url.search}`,
    clickId: clickId ? "present" : "none",
    timestamp: new Date().toISOString(),
  };
}

export function trackTrafficSource(): TrafficSourceData {
  const cached = getFromSessionStorage(SESSION_STORAGE_KEY);
  const trafficData: TrafficSourceData = cached ? JSON.parse(cached) : resolveTrafficSource();

  if (!cached) {
    setInSessionStorage(SESSION_STORAGE_KEY, JSON.stringify(trafficData));
  }

  const alreadySent = getFromSessionStorage(EVENT_SENT_KEY) === "1";
  if (!alreadySent && typeof window.gtag === "function") {
    window.gtag("event", "traffic_source_detected", {
      source: trafficData.source,
      medium: trafficData.medium,
      campaign: trafficData.campaign,
      channel: trafficData.channel,
      referrer_host: trafficData.referrerHost,
      landing_path: trafficData.landingPath,
      click_id: trafficData.clickId,
    });
    setInSessionStorage(EVENT_SENT_KEY, "1");
  }

  return trafficData;
}
