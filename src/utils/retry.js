function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(fn, options = {}) {
  const {
    retries = 4,
    delayMs = 1000
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const message = String(error?.message || "");
      const status = String(error?.status || "");
      const code = Number(error?.code);

      const isUnavailable =
        code === 503 ||
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        status === "UNAVAILABLE";

      if (!isUnavailable) {
        throw error;
      }

      if (attempt === retries) {
        throw new Error(
          "Η Gemini είναι προσωρινά μη διαθέσιμη μετά από 4 προσπάθειες. Δοκίμασε ξανά σε λίγο."
        );
      }

      console.log(
        `Gemini unavailable. Retry ${attempt}/${retries - 1} in ${delayMs}ms...`
      );

      await sleep(delayMs);
    }
  }

  throw lastError;
}