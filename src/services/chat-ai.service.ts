import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const PRIMARY_MODEL = "qwen/qwen3.8-27b:free";
const FALLBACK_MODEL = "openrouter/free";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const requestAI = async (
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model,

    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages,
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(`AI model ${model} returned an empty response`);
  }

  console.log(`AI response generated using: ${model}`);

  return content.trim();
};

export const generateAIResponse = async (
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> => {
  try {
    console.log(`Trying primary model: ${PRIMARY_MODEL}`);

    return await requestAI(
      PRIMARY_MODEL,
      systemPrompt,
      messages,
    );
  } catch (primaryError) {
    console.error(
      `Primary model failed: ${PRIMARY_MODEL}`,
      primaryError,
    );

    console.log(`Trying fallback model: ${FALLBACK_MODEL}`);

    return await requestAI(
      FALLBACK_MODEL,
      systemPrompt,
      messages,
    );
  }
};