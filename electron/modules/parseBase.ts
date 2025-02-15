import { ArchiveReaderStreamZip } from "../helpers//parseCookieRar";

export const parseBase = async (basePath: string) => {
  const reader = new ArchiveReaderStreamZip(basePath);

  const tokens = await reader.findEpicTokensInCookiesFolder();

  return tokens;
};
