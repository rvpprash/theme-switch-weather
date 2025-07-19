export default async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("fetchWithTimeout error: Request timed out");
    } else {
      console.error("fetchWithTimeout error:", err);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}
