export const forceDownloadFile = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "video.mp4";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};
