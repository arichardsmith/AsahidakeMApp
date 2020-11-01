/**
 * この関数はAsahidakeMapのwrapperで、
 * マップのスクリプトロード済まない場合、cacheするためのもの
 */

let hasLoaded = false;
let deferedFit = null;
/**
 * Viewの範囲変化
 *
 * @param {string|Array<number>} extent - 登山道のstring又はnumberのarray
 */
export function fitView(view) {
  if (hasLoaded) {
    return AsahidakeMap.fitView(view);
  }

  deferedFit = view;
}

let deferedHighlight = null;
/**
 * 登山道ハイライト
 * 現在ハイライトできる登山道は：（./extents.jsによる}
 * sugatami, summit, nakadake, loop, tennyoga, nakadake
 *
 * @param {string} trail - 登山道の名前 (romajiで)
 */
export function highlightTrail(trail) {
  if (hasLoaded) {
    return AsahidakeMap.highlightTrail(trail);
  }

  deferedHighlight = trail;
}

export async function getMap() {
  const map = await loadMap();
  return map;
}

function loadMap() {
  return new Promise((resolve, reject) => {
    if (window.AsahidakeMap !== undefined) {
      return resolve(window.AsahidakeMap);
    }

    const scriptElement = document.getElementById("map-script");
    scriptElement.addEventListener("load", () => {
      if (window.AsahidakeMap !== undefined) {
        hasLoaded = true;
        resolve(window.AsahidakeMap);
      } else {
        reject(new Error("Error loading map script"));
      }
    });
  });
}

loadMap();
