export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('spaceCollab_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like DELETE)
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};
