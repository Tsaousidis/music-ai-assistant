export function formatError(error) {
  try {
    return JSON.stringify(
      {
        message: error?.message ?? null,
        statusCode: error?.statusCode ?? null,
        body: error?.body ?? null,
        stack: error?.stack ?? null
      },
      null,
      2
    );
  } catch {
    return String(error);
  }
}