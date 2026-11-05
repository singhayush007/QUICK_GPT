/** All backend endpoints in one place. */
export const API_PATHS = {
  user: {
    register: "/api/user/register",
    login: "/api/user/login",
    data: "/api/user/data",
    publishedImages: "/api/user/published-images",
  },
  chat: {
    create: "/api/chat/create",
    list: "/api/chat/get",
    rename: "/api/chat/rename",
    pin: "/api/chat/pin",
    remove: "/api/chat/delete",
  },
  message: {
    models: "/api/message/models",
    text: "/api/message/text",
    stream: "/api/message/stream",
    image: "/api/message/image",
  },
  credit: {
    plans: "/api/credit/plan",
    history: "/api/credit/history",
    purchase: "/api/credit/purchase",
    verify: "/api/credit/verify",
  },
  share: {
    create: "/api/share/create",
    remove: "/api/share/remove",
    import: "/api/share/import",
    byId: (shareId: string) => `/api/share/${shareId}`,
  },
  live: {
    weather: "/api/live/weather",
    aqi: "/api/live/aqi",
    markets: "/api/live/markets",
    scores: "/api/live/scores",
  },
  voice: {
    list: "/api/voice/list",
    speak: "/api/voice/speak",
  },
} as const;
