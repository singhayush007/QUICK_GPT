import * as messageService from "./message.service.js";
import { AppError, errorBody } from "../../shared/utils/httpErrors.js";

/** Maps failures to a sensible HTTP status + message. */
function sendError(res, error) {
  // expected, client-facing failures (403 upgrade, 404 chat, 400 prompt / credits, 503 images)
  if (error instanceof AppError) {
    return res.status(error.status).json(errorBody(error));
  }

  console.error("Message error:", error.message);
  const status =
    error.status || error.statusCode || error.response?.status || 500;
  const msg = error.message || "Internal server error";

  if (status === 429 || /rate limit|quota/i.test(msg)) {
    return res.status(429).json({
      success: false,
      message: "The AI provider is rate limited. Please try again shortly.",
    });
  }
  if (status === 402 || /Payment Required|spend limit/i.test(msg)) {
    return res.status(402).json({
      success: false,
      message:
        "AI provider credit limit reached. Switch to Gemini (free) or top up the provider.",
    });
  }
  const code = status >= 400 && status < 600 ? status : 500;
  return res.status(code).json({ success: false, message: msg });
}

/** GET /api/message/models — catalogue with per-user lock state. */
export const listModels = (req, res) =>
  res.json({ success: true, models: messageService.listModels(req.user), plan: req.user.plan });

/** POST /api/message/text — single JSON response. */
export const textMessageController = async (req, res) => {
  const { chatId, prompt, regenerate, model, persona, voice } = req.body;
  try {
    const { reply, credits } = await messageService.createTextReply(req.user, {
      chatId, prompt, regenerate, model, persona, voice,
    });
    res.status(200).json({ success: true, reply, credits });
  } catch (error) {
    sendError(res, error);
  }
};

/**
 * POST /api/message/stream — Server-Sent Events.
 * Events: {type:"token",text} ... then {type:"done",reply,credits} or {type:"error",message}
 */
export const streamMessageController = async (req, res) => {
  const { chatId, prompt, regenerate, model, persona, voice } = req.body;

  // Abort the upstream AI request when the client presses "Stop" / disconnects.
  // Registered first so a very early disconnect is not missed.
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const result = await messageService.createStreamReply(
      req.user,
      { chatId, prompt, regenerate, model, persona, voice },
      {
        signal: controller.signal,
        onStart: () =>
          res.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          }),
        onToken: (text) => send({ type: "token", text }),
      }
    );
    if (!result) return res.end(); // client stopped: credit already refunded

    send({ type: "done", reply: result.reply, credits: result.credits });
    res.end();
  } catch (error) {
    if (res.headersSent) {
      console.error("Stream error:", error.message);
      res.write(
        `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`
      );
      return res.end();
    }
    sendError(res, error);
  }
};

/** POST /api/message/image */
export const imageMessageController = async (req, res) => {
  try {
    messageService.assertImagesConfigured();
    const { chatId, prompt, regenerate, isPublished, size } = req.body;
    const { reply, credits } = await messageService.createImageReply(req.user, {
      chatId, prompt, regenerate, isPublished, size,
    });
    res.status(200).json({ success: true, reply, credits });
  } catch (error) {
    sendError(res, error);
  }
};
