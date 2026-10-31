// Turns any Axios error into a message that is safe to show to the user
export function getErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request) return "Can't reach the server. Check your connection.";
  return fallback;
}
