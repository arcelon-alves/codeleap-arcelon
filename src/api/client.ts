const BASE_URL = "https://dev.codeleap.co.uk/careers/";
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function request<T>(
  path: string,
  { body, headers, ...options }: RequestOptions = {}
): Promise<T> {
  const url = ABSOLUTE_URL_REGEX.test(path) ? path : `${BASE_URL}${path}`;
  const shouldSendJsonHeader = body !== undefined && body !== null;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(shouldSendJsonHeader ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
