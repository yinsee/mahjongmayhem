// Tile faces as SVG — the same drawing as the web game's canvas art (mahjong/js/textures.js): dots, bamboo sticks,
// the 1-bamboo bird, 萬 characters, winds, dragons and flowers. faceSVG(t) returns an <svg> string, viewBox 256 × 348.

const W = 256, H = 348;
const NUM_ZH = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const FONT = `'Noto Serif SC','Songti SC','STSong','SimSun',serif`;
const BLUE = '#1d4fa8', GREEN = '#127a3a', RED = '#c8102e', NAVY = '#14213d', PAPER = '#fbf6e9';

function circleDot(x, y, r, c) {
  let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="${PAPER}"/>`
    + `<circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="${c}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    s += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(a) * r * 0.48}" y2="${y + Math.sin(a) * r * 0.48}" stroke="${PAPER}" stroke-width="${r * 0.08}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r * 0.14}" fill="${PAPER}"/>`;
}

function stick(x, y, len, c, rot = 0) {
  const w = 22;
  let s = `<g transform="translate(${x} ${y}) rotate(${(rot * 180) / Math.PI})">`
    + `<rect x="${-w / 2}" y="${-len / 2}" width="${w}" height="${len}" rx="10" fill="${c}"/>`
    + `<rect x="${-w / 2 + 4}" y="${-len / 2 + 6}" width="4" height="${len - 12}" fill="rgba(255,255,255,.35)"/>`;
  for (const fy of [-0.5, 0, 0.5]) s += `<rect x="${-w / 2 - 2}" y="${fy * len * 0.8 - 3}" width="${w + 4}" height="6" fill="rgba(0,0,0,.35)"/>`;
  return s + '</g>';
}

function bird() {
  let s = `<g transform="translate(${W / 2} ${H / 2 + 6})">`;
  for (const [a, c] of [[-0.9, RED], [-0.45, BLUE], [0, GREEN], [0.45, BLUE], [0.9, RED]]) {
    s += `<g transform="rotate(${((a * 0.6 + Math.PI) * 180) / Math.PI})"><ellipse cx="0" cy="-70" rx="20" ry="62" fill="${c}"/>`
      + `<circle cx="0" cy="-110" r="10" fill="#f2c14e"/></g>`;
  }
  s += `<ellipse cx="0" cy="-10" rx="42" ry="56" fill="${GREEN}"/>`
    + `<ellipse cx="-10" cy="-12" rx="22" ry="36" fill="${BLUE}" transform="rotate(${(0.3 * 180) / Math.PI} -10 -12)"/>`
    + `<circle cx="14" cy="-78" r="26" fill="${RED}"/><circle cx="22" cy="-84" r="9" fill="#fff"/><circle cx="24" cy="-84" r="5" fill="#000"/>`
    + `<path d="M38 -80 L64 -72 L38 -66 Z" fill="#f2a900"/>`;
  for (const dx of [-10, 0, 10]) s += `<line x1="14" y1="-102" x2="${14 + dx * 1.4}" y2="-124" stroke="${RED}" stroke-width="5"/>`;
  return s + '</g>';
}

const DOTS = {
  1: [[0.5, 0.5]],
  2: [[0.5, 0.27], [0.5, 0.73]],
  3: [[0.24, 0.2], [0.5, 0.5], [0.76, 0.8]],
  4: [[0.28, 0.27], [0.72, 0.27], [0.28, 0.73], [0.72, 0.73]],
  5: [[0.26, 0.22], [0.74, 0.22], [0.5, 0.5], [0.26, 0.78], [0.74, 0.78]],
  6: [[0.3, 0.17], [0.7, 0.17], [0.3, 0.5], [0.7, 0.5], [0.3, 0.83], [0.7, 0.83]],
  7: [[0.22, 0.13], [0.5, 0.25], [0.78, 0.37], [0.3, 0.62], [0.7, 0.62], [0.3, 0.86], [0.7, 0.86]],
  8: [[0.3, 0.13], [0.7, 0.13], [0.3, 0.38], [0.7, 0.38], [0.3, 0.62], [0.7, 0.62], [0.3, 0.87], [0.7, 0.87]],
  9: [[0.2, 0.17], [0.5, 0.17], [0.8, 0.17], [0.2, 0.5], [0.5, 0.5], [0.8, 0.5], [0.2, 0.83], [0.5, 0.83], [0.8, 0.83]],
};
const DOT_R = { 1: 88, 2: 52, 3: 44, 4: 42, 5: 38, 6: 34, 7: 30, 8: 28, 9: 30 };
const DOT_COL = {
  1: [RED], 2: [GREEN, BLUE], 3: [BLUE, RED, GREEN], 4: [BLUE, GREEN, GREEN, BLUE], 5: [BLUE, GREEN, RED, GREEN, BLUE],
  6: [GREEN, GREEN, RED, RED, RED, RED], 7: [GREEN, GREEN, GREEN, RED, RED, RED, RED], 8: Array(8).fill(BLUE),
  9: [BLUE, BLUE, BLUE, RED, RED, RED, GREEN, GREEN, GREEN],
};
const STICKS = {
  2: [[0.5, 0.27], [0.5, 0.73]],
  3: [[0.5, 0.27], [0.3, 0.73], [0.7, 0.73]],
  4: [[0.3, 0.27], [0.7, 0.27], [0.3, 0.73], [0.7, 0.73]],
  5: [[0.25, 0.27], [0.75, 0.27], [0.5, 0.5, 1], [0.25, 0.73], [0.75, 0.73]],
  6: [[0.2, 0.27], [0.5, 0.27], [0.8, 0.27], [0.2, 0.73], [0.5, 0.73], [0.8, 0.73]],
  7: [[0.5, 0.17, 1], [0.2, 0.5], [0.5, 0.5], [0.8, 0.5], [0.2, 0.83], [0.5, 0.83], [0.8, 0.83]],
  8: [[0.12, 0.27], [0.39, 0.27, 0, 0.42], [0.61, 0.27, 0, -0.42], [0.88, 0.27],
    [0.12, 0.73], [0.39, 0.73, 0, -0.42], [0.61, 0.73, 0, 0.42], [0.88, 0.73]],
  9: [[0.2, 0.17], [0.5, 0.17, 1], [0.8, 0.17], [0.2, 0.5], [0.5, 0.5, 1], [0.8, 0.5], [0.2, 0.83], [0.5, 0.83, 1], [0.8, 0.83]],
};

const text = (s, x, y, size, color, weight = 900, anchor = 'middle', font = FONT) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-weight="${weight}" font-size="${size}" fill="${color}" text-anchor="${anchor}" dominant-baseline="central">${s}</text>`;
const corner = (s, color) => `<text x="14" y="10" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="${color}" dominant-baseline="hanging">${s}</text>`;

export function faceSVG(t) {
  const pad = 22, iw = W - pad * 2, ih = H - pad * 2;
  let b = '';
  if (t < 9) {
    b = text(NUM_ZH[t], W / 2, H * 0.3, 120, NAVY) + text('萬', W / 2, H * 0.68, 150, RED) + corner(String(t + 1), RED);
  } else if (t < 18) {
    const r = t - 8;
    b = DOTS[r].map(([x, y], i) => circleDot(pad + x * iw, pad + y * ih, DOT_R[r], DOT_COL[r][i])).join('');
    if (r === 1) b += `<circle cx="${W / 2}" cy="${H / 2}" r="104" fill="none" stroke="${GREEN}" stroke-width="6"/>`;
  } else if (t < 27) {
    const r = t - 17;
    if (r === 1) b = bird();
    else {
      const len = r === 7 || r === 9 ? 82 : 120;
      b = STICKS[r].map(([x, y, red, rot]) => stick(pad + x * iw, pad + y * ih, len, red ? RED : GREEN, rot || 0)).join('');
    }
  } else if (t < 31) {
    b = text(['東', '南', '西', '北'][t - 27], W / 2, H / 2 + 8, 170, NAVY) + corner(['E', 'S', 'W', 'N'][t - 27], BLUE);
  } else if (t === 31) {
    b = text('中', W / 2, H / 2 + 6, 190, RED);
  } else if (t === 32) {
    b = text('發', W / 2, H / 2 + 6, 180, GREEN);
  } else if (t === 33) {
    b = `<rect x="46" y="50" width="${W - 92}" height="${H - 100}" fill="none" stroke="${BLUE}" stroke-width="12"/>`
      + `<rect x="66" y="70" width="${W - 132}" height="${H - 140}" fill="none" stroke="${BLUE}" stroke-width="4"/>`;
  } else {
    const f = t - 34;
    const chars = ['梅', '蘭', '竹', '菊', '春', '夏', '秋', '冬'];
    const cols = ['#d6336c', '#7048e8', '#2b8a3e', '#e67700', '#2f9e44', '#e03131', '#d9480f', '#1c7ed6'];
    for (let i = 0; i < 6; i++) {
      b += `<circle cx="${W / 2 + Math.cos(i) * 70}" cy="${H / 2 + Math.sin(i * 1.7) * 90}" r="${30 + (i % 3) * 8}" fill="${cols[f]}" opacity=".18"/>`;
    }
    b += text(chars[f], W / 2, H / 2 + 20, 150, cols[f]) + corner(String((f % 4) + 1), cols[f])
      + text(f < 4 ? '✿' : '☀', W - 18, 30, 28, cols[f], 700, 'end', 'Arial,sans-serif');
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${b}</svg>`;
}
