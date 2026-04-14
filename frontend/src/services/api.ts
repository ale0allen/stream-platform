const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export interface ApiError {
  message: string;
  details?: string[];
}

export interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  let errorMessage = "Request failed";
  let errorDetails: string[] | undefined;

  try {
    const errorBody = (await response.json()) as ApiError;
    errorMessage = errorBody.message || errorMessage;
    errorDetails = errorBody.details;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  throw new Error(errorDetails?.length ? `${errorMessage}: ${errorDetails.join(", ")}` : errorMessage);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  return parseResponse<T>(response);
}

export { API_URL };
