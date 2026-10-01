interface TextChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export const chunkText = (
  text: string,
  options: TextChunkOptions = {}
): string[] => {
  const chunkSize = options.chunkSize ?? 8000;
  const overlap = options.overlap ?? 500;

  if (!text.trim()) {
    return [];
  }

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanedText.length) {
    const maxEnd = Math.min(
      start + chunkSize,
      cleanedText.length
    );

    // Last chunk
    if (maxEnd === cleanedText.length) {
      const finalChunk = cleanedText
        .slice(start)
        .trim();

      if (finalChunk) {
        chunks.push(finalChunk);
      }

      break;
    }

    let end = findBestBreakPoint(
      cleanedText,
      start,
      maxEnd
    );

    const chunk = cleanedText
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    // Move backwards by the overlap amount.
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
};

const findBestBreakPoint = (
  text: string,
  start: number,
  maxEnd: number
): number => {
  const minimumBreakPosition =
    start + Math.floor((maxEnd - start) * 0.6);

  // 1. Prefer paragraph breaks.
  const paragraphBreak = text.lastIndexOf(
    "\n\n",
    maxEnd
  );

  if (paragraphBreak >= minimumBreakPosition) {
    return paragraphBreak;
  }

  // 2. Look for sentence endings.
  const sentencePattern =
    /[.!?]["')\]]?(?=\s|$)/g;

  let sentenceEnd = -1;
  let match: RegExpExecArray | null;

  sentencePattern.lastIndex = start;

  while (
    (match = sentencePattern.exec(text)) !== null
  ) {
    const position = match.index + match[0].length;

    if (position > maxEnd) {
      break;
    }

    if (position >= minimumBreakPosition) {
      sentenceEnd = position;
    }
  }

  if (sentenceEnd !== -1) {
    return sentenceEnd;
  }

  // 3. Fall back to a word boundary.
  const wordBreak = text.lastIndexOf(
    " ",
    maxEnd
  );

  if (wordBreak > start) {
    return wordBreak;
  }

  // 4. Absolute last resort.
  return maxEnd;
};