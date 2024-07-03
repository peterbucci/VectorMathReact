const openExternalLink = (url) => {
  // Check if the electron shell module is available
  if (window.require) {
    const { shell } = window.require("electron");
    shell.openExternal(url);
  } else {
    window.open(url, "_blank");
  }
};

export default openExternalLink;
