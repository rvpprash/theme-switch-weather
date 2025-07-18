export default async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000 // 10 second default
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err) {
    if ((err as any).name === "AbortError") {
      console.error("fetchWithTimeout error: Request timed out");
    } else {
      console.error("fetchWithTimeout error:", err);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}
