const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    // Solo aceptamos protocolos http y https
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
};

module.exports = { isValidUrl };