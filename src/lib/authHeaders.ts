export const getAccessTokenHeaders = async (
  getAccessToken: () => Promise<string | null>,
): Promise<Record<string, string>> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};
