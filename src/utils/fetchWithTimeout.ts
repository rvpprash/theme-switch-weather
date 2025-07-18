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
	  console.error("fetchWithTimeout error:", err);
	  throw err;
	} finally {
	  clearTimeout(id);
	}
  }
  