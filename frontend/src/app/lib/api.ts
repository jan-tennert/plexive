const API_URL = process.env.NEXT_PUBLIC_API_URL

// Wrapper around fetch that automatically attaches the Authorization header
// when a token is present in localStorage. Use this for any API call that
// may require authentication.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("deepscroll_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`
  return fetch(`${API_URL}${path}`, { ...options, headers })
}
