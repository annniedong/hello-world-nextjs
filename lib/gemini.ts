import { ApiError, GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    safe: { type: "boolean" },
    captions: { type: "array", items: { type: "string" } },
  },
  required: ["safe", "captions"],
};

export type CaptionResult = {
  safe: boolean;
  captions: string[];
  model: string;
};

export class CaptionError extends Error {
  constructor(
    public kind: "rate_limit" | "not_configured" | "failed",
    message: string,
  ) {
    super(message);
  }
}

export async function generateCaptions(args: {
  bytes: Buffer;
  mimeType: string;
  prompt: string;
}): Promise<CaptionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new CaptionError("not_configured", "GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  let text: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          inlineData: {
            mimeType: args.mimeType,
            data: args.bytes.toString("base64"),
          },
        },
        { text: args.prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });
    text = response.text;
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      throw new CaptionError("rate_limit", "Gemini rate limit reached");
    }
    console.error("Gemini request failed", error);
    throw new CaptionError("failed", "Gemini request failed");
  }

  let parsed: { safe?: unknown; captions?: unknown };
  try {
    parsed = JSON.parse(text ?? "");
  } catch {
    throw new CaptionError("failed", "Gemini returned malformed JSON");
  }

  const captions = Array.isArray(parsed.captions)
    ? parsed.captions
        .filter((c): c is string => typeof c === "string")
        .map((c) => c.trim())
        .filter((c) => c.length > 0 && c.length <= 300)
        .slice(0, 3)
    : [];

  return { safe: parsed.safe === true, captions, model: MODEL };
}
