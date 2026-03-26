export const isObjEmpty = (obj) => {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
};

export function generateUUID(digits) {
  let str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ";
  let uuid = [];
  for (let i = 0; i < digits; i++) {
    uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return uuid.join("");
}

export const checkValOrReturnStr = (val) => {
  return val !== undefined &&
    val !== null &&
    val !== isNaN &&
    typeof val === "string"
    ? val
    : "";
};

export const checkValOrReturnNum = (val) => {
  return val !== undefined &&
    val !== null &&
    val !== isNaN &&
    typeof val === "number"
    ? val
    : 0;
};

export const getMimeType = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const mimeTypes = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    json: "application/json",
    csv: "text/csv",
  };
  return mimeTypes[extension] || "*/*"; // Default to any file type
};

/**
 * Strips HTML tags from text content
 * @param {string} htmlString - The HTML string to clean
 * @returns {string} - Clean text without HTML tags
 */
export const stripHtml = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }
  
  return htmlString.replace(/<[^>]*>/g, '').trim();
};
