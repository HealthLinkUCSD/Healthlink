export const getAccessTokenHeaders = async (getAccessToken: () => Promise<string | null>) => {
  const accessToken = await getAccessToken();

  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {};
};
