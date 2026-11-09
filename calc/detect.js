// Tile detector in the browser: the YOLO model trained in mahjong/vision, exported to TensorFlow.js (calc/model/).
// Class index == tile id (0-33 tiles, 34-41 flowers), the same ids scoring.js uses. Runs fully on the device.

const TFJS = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const MODEL = new URL('./model/model.json', import.meta.url).href;
const SIZE = 640;

let tfReady = null, modelReady = null;

/** true when a trained model is published next to this file */
export async function modelAvailable() {
  try { return (await fetch(MODEL, { method: 'HEAD', cache: 'no-store' })).ok; } catch { return false; }
}

function loadTF() {
  if (window.tf) return Promise.resolve(window.tf);
  tfReady ??= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = TFJS;
    s.onload = () => res(window.tf);
    s.onerror = () => rej(new Error('TensorFlow.js did not load'));
    document.head.append(s);
  });
  return tfReady;
}

async function loadModel() {
  const tf = await loadTF();
  modelReady ??= tf.loadGraphModel(MODEL).then(async m => {
    // warm-up: the first run compiles the shaders
    const z = tf.zeros([1, SIZE, SIZE, 3]);
    const o = m.execute(z);
    (Array.isArray(o) ? o : [o]).forEach(t => t.dispose());
    z.dispose();
    return m;
  });
  return [tf, await modelReady];
}

/**
 * Detect tiles in an <img>. Returns [{t, x, y, w, h, score}] in image pixels, in reading order
 * (rows top to bottom, each row left to right).
 */
export async function detectTiles(img, { minScore = 0.35, iou = 0.45, max = 40 } = {}) {
  const [tf, model] = await loadModel();
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const k = Math.min(SIZE / iw, SIZE / ih);
  // letterbox into 640 × 640 (grey pad, as Ultralytics trains)
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const g = c.getContext('2d');
  g.fillStyle = 'rgb(114,114,114)';
  g.fillRect(0, 0, SIZE, SIZE);
  g.drawImage(img, 0, 0, iw * k, ih * k);

  const dets = tf.tidy(() => {
    const x = tf.browser.fromPixels(c).toFloat().div(255).expandDims(0);
    let y = model.execute(x);
    if (Array.isArray(y)) y = y[0];
    // [1, 4 + classes, anchors] → [anchors, 4 + classes]
    const p = y.shape[1] < y.shape[2] ? y.squeeze([0]).transpose() : y.squeeze([0]);
    const xywh = p.slice([0, 0], [-1, 4]);
    const cls = p.slice([0, 4], [-1, -1]);
    const [cx, cy, w, h] = tf.split(xywh, 4, 1);
    const boxes = tf.concat([cy.sub(h.div(2)), cx.sub(w.div(2)), cy.add(h.div(2)), cx.add(w.div(2))], 1);
    return { boxes, scores: cls.max(1), classes: cls.argMax(1) };
  });
  const keep = await tf.image.nonMaxSuppressionAsync(dets.boxes, dets.scores, max, iou, minScore);
  const [b, s, cl, ix] = await Promise.all([dets.boxes.array(), dets.scores.array(), dets.classes.array(), keep.array()]);
  [dets.boxes, dets.scores, dets.classes, keep].forEach(t => t.dispose());

  const out = ix.map(i => {
    const [y1, x1, y2, x2] = b[i];
    return { t: cl[i], score: s[i], x: x1 / k, y: y1 / k, w: (x2 - x1) / k, h: (y2 - y1) / k };
  });
  return readingOrder(out);
}

// rows: a tile joins a row when its centre is within half a tile height of the row's centre line
function readingOrder(ds) {
  const rows = [];
  for (const d of [...ds].sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2))) {
    const cy = d.y + d.h / 2;
    const row = rows.find(r => Math.abs(r.cy - cy) < d.h * 0.5);
    if (row) row.items.push(d); else rows.push({ cy, items: [d] });
  }
  return rows.flatMap(r => r.items.sort((a, b) => a.x - b.x));
}
