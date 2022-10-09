export const urlWithProxy = (url: string) =>
  `https://corsproxy.io/?${encodeURIComponent(url)}`;
