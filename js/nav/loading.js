import $ from "jquery";

/**
 * Load content from url and insert it into target element.
 * @param {string} target - Element selector
 * @param {string} url - Url to load
 */
export function loadURL(selector, url) {
  return new Promise((resolve, reject) => {
    $(selector).load(url, (_, status, xhr) => {
      if (status === "error") {
        reject(new LoadError(xhr.status, xhr.statusText));
      } else {
        resolve();
      }
    });
  });
}

class LoadError extends Error {
  constructor(statusCode, statusText) {
    super(statusText);
    this.code = statusCode;
  }
}
