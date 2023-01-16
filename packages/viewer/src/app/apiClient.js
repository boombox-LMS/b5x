// A tiny wrapper around fetch(), borrowed from
// https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper

export async function apiClient(
  endpoint,
  { method, body, ...customConfig } = {}
) {
  const headers = { "Content-Type": "application/json" };

  const config = {
    method,
    ...customConfig,
    credentials: "include",
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let data;
  try {
    const response = await window.fetch(endpoint, config);
    data = await response.json();
    if (response.ok) {
      // Return a result object similar to Axios
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }
    throw new Error(response.statusText);
  } catch (err) {
    return Promise.reject(err.message ? err.message : data);
  }
}

apiClient.get = function (endpoint, customConfig = {}) {
  return apiClient(endpoint, { ...customConfig, method: "GET" });
};

apiClient.post = function (endpoint, body, customConfig = {}) {
  return apiClient(endpoint, { ...customConfig, body, method: "POST" });
};
