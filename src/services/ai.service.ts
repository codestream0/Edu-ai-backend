import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const PRIMARY_MODEL = "qwen/qwen3.8-27b:free";
const FALLBACK_MODEL = "openrouter/free";

const requestAI = async (
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(`AI model ${model} returned an empty response`);
  }

  console.log(`AI response generated using: ${model}`);

  return content.trim();
};

const generateAIResponse = async (
  systemPrompt: string,
  userPrompt: string,
): Promise<string> => {
  try {
    console.log(`Trying primary model: ${PRIMARY_MODEL}`);

    return await requestAI(PRIMARY_MODEL, systemPrompt, userPrompt);
  } catch (primaryError) {
    console.error(`Primary model failed: ${PRIMARY_MODEL}`);

    console.error(primaryError);

    console.log(`Trying fallback model: ${FALLBACK_MODEL}`);

    return await requestAI(FALLBACK_MODEL, systemPrompt, userPrompt);
  }
};

export const summarizeChunk = async (chunk: string): Promise<string> => {
  return generateAIResponse(
    `
You are EDU AI, an AI learning assistant for university students.

Summarize educational material accurately.

Rules:
- Use only information from the provided text.
- Do not invent facts.
- Preserve important definitions, concepts, formulas, examples, and facts.
- Remove unnecessary repetition.
- Make the explanation easy for a university student to understand.
- Keep important technical terms.
    `.trim(),

    `
Summarize this section of a larger educational document.

DOCUMENT SECTION:

${chunk}
    `.trim(),
  );
};

export const generateFinalSummary = async (
  chunkSummaries: string[],
): Promise<string> => {
  if (chunkSummaries.length === 0) {
    throw new Error("No chunk summaries provided");
  }

  const combinedSummaries = chunkSummaries
    .map((summary, index) => `SECTION ${index + 1}\n${summary}`)
    .join("\n\n");

  return generateAIResponse(
    `
You are EDU AI, an AI learning assistant for university students.

Create a coherent final study summary from the provided
section summaries.

Rules:
- Use only information contained in the section summaries.
- Do not invent information.
- Remove repetition between sections.
- Organize the result logically.
- Use clear headings.
- Use bullet points when useful.
- Preserve important definitions, concepts, formulas, examples,
  and facts.
- Make the final result useful for studying and exam preparation.
    `.trim(),

    `
Create the final summary of this educational document.

SECTION SUMMARIES:

${combinedSummaries}
    `.trim(),
  );
};
