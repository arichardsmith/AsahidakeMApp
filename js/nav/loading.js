import $ from 'jquery';

/**
 * Load content from url and insert it into target element.
 * @param {string} target - Element selector
 * @param {string} url - Url to load
 */
export function loadURL(selector, url) {
  const timer = setTimeout(loaderStart, 100); // Wait incase of quick load

  return new Promise((resolve, reject) => {
    $(selector).load(url, (_, status, xhr) => {
      clearTimeout(timer);
      if (status === 'error') {
        const errMsg = xhr.statusText;
        loaderError(errMsg);
        reject(new Error(errMsg));
      } else {
        loaderFinish();
        resolve();
      }
    });
  });
}

const loaderElement = document.getElementById('loader');
const loaderBox = loaderElement.querySelector('.message');
const loaderMessage = loaderElement.querySelector('.message-text');
const loaderProgress = loaderElement.querySelector('progress');

function updateLoader(newState, msg) {
  console.log(`${newState} - ${msg}`);
  switch (newState) {
    case 'loading':
      loaderMessage.innerText = '読み込み中';
      loaderProgress.style.display = 'block';
      loaderBox.classList.remove('is-danger');
      loaderElement.classList.add('visible');
      break;
    case 'error':
      loaderMessage.innerHTML = `読み込みエラー<br />${msg}`;
      loaderProgress.style.display = 'none';
      loaderBox.classList.add('is-danger');
      loaderElement.classList.add('visible');
      break;
    default:
      // Hide
      loaderElement.classList.remove('visible');
  }
}

export function loaderStart() {
  updateLoader('loading');
}

export function loaderFinish() {
  updateLoader();
}

export function loaderError(message) {
  updateLoader('error', message);
}
