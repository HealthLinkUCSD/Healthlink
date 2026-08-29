export const getBoardEmails = () =>
  (process.env.BOARD_MEMBER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isBoardEmail = (email: string | null | undefined) => {
  if (!email) return false;
  return getBoardEmails().includes(email.trim().toLowerCase());
};
