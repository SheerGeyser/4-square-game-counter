import * as hmUI from "@zos/ui";
import { event } from "@zos/ui";
import { log as Logger } from "@zos/utils";
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  LABEL_TEXT_SIZE,
  COUNTER_TEXT_SIZE,
  ICON_TEXT_SIZE,
  LETTER_CENTERS,
  COUNTER_CENTERS,
} from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("helloworld");

/** Тройной тап в центре: не больше этого интервала (мс) между первым и последним из трёх тапов по скользящему окну */
const TRIPLE_TAP_WINDOW_MS = 1000;

const COLORS = [0x701010, 0x441a3c, 0x1a2a44, 0x3d2b1f];
const LABELS = ["K", "D", "V", "G"];

/** Клин от центра (cx,cy): углы в радианах, мат. угол = atan2(dy,dx) */
function drawPieSlice(canvas, cx, cy, r, a0, a1, color) {
  const segs = 20;
  const data = [{ x: cx, y: cy }];
  for (let i = 0; i <= segs; i++) {
    const t = a0 + (a1 - a0) * (i / segs);
    data.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
  }
  canvas.drawPoly({ data_array: data, color });
}

function sectorHit(deg) {
  let d = deg;
  while (d <= -180) d += 360;
  while (d > 180) d -= 360;
  let cell;
  if (d > -180 && d <= -90) cell = 0;
  else if (d > -90 && d <= 0) cell = 1;
  else if (d > 0 && d <= 90) cell = 3;
  else if (d > 90 && d <= 180) cell = 2;
  else cell = 0;

  let mid;
  if (cell === 0) mid = -135;
  else if (cell === 1) mid = -45;
  else if (cell === 2) mid = 135;
  else mid = 45;

  const delta = d <= mid ? -1 : 1;
  return { cellIndex: cell, delta };
}

Page({
  state: {
    counts: [0, 0, 0, 0],
  },
  onInit() {
    logger.debug("page onInit invoked");
  },
  build() {
    logger.debug("page build invoked");

    const W = DEVICE_WIDTH;
    const H = DEVICE_HEIGHT;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(cx, cy) - 2;
    const R_INNER = 32;
    const R_ICON = R * 0.78;

    const page = this;

    const wedges = [
      { a0: -Math.PI, a1: (-3 * Math.PI) / 4, color: COLORS[0] },
      { a0: (-3 * Math.PI) / 4, a1: -Math.PI / 2, color: COLORS[0] },
      { a0: -Math.PI / 2, a1: -Math.PI / 4, color: COLORS[1] },
      { a0: -Math.PI / 4, a1: 0, color: COLORS[1] },
      { a0: 0, a1: Math.PI / 4, color: COLORS[3] },
      { a0: Math.PI / 4, a1: Math.PI / 2, color: COLORS[3] },
      { a0: Math.PI / 2, a1: (3 * Math.PI) / 4, color: COLORS[2] },
      { a0: (3 * Math.PI) / 4, a1: Math.PI, color: COLORS[2] },
    ];

    const iconAnglesDeg = [
      (-180 + -135) / 2,
      (-135 + -90) / 2,
      (-90 + -45) / 2,
      (-45 + 0) / 2,
      (0 + 45) / 2,
      (45 + 90) / 2,
      (90 + 135) / 2,
      (135 + 180) / 2,
    ];

    const canvas = hmUI.createWidget(hmUI.widget.CANVAS, {
      x: 0,
      y: 0,
      w: W,
      h: H,
    });

    const redraw = () => {
      canvas.clear({ x: 0, y: 0, w: W, h: H });
      const counts = page.state.counts;

      wedges.forEach((wedge) => {
        drawPieSlice(canvas, cx, cy, R, wedge.a0, wedge.a1, wedge.color);
      });

      for (let i = 0; i < 4; i++) {
        const cc = COUNTER_CENTERS[i];
        canvas.drawText({
          x: cc.x - COUNTER_TEXT_SIZE / 2,
          y: cc.y - COUNTER_TEXT_SIZE / 2,
          text: String(counts[i]),
          text_size: COUNTER_TEXT_SIZE,
          color: 0xffffff,
        });
      }

      for (let i = 0; i < 4; i++) {
        const lc = LETTER_CENTERS[i];
        canvas.drawText({
          x: lc.x - LABEL_TEXT_SIZE / 2,
          y: lc.y - LABEL_TEXT_SIZE / 2,
          text: LABELS[i],
          text_size: LABEL_TEXT_SIZE,
          color: 0xffffff,
        });
      }

      for (let k = 0; k < 8; k++) {
        const ang = (iconAnglesDeg[k] * Math.PI) / 180;
        const ix = cx + R_ICON * Math.cos(ang);
        const iy = cy + R_ICON * Math.sin(ang);
        const isMinus = k % 2 === 0;
        canvas.drawText({
          x: ix - ICON_TEXT_SIZE / 2,
          y: iy - ICON_TEXT_SIZE / 2,
          text: isMinus ? "-" : "+",
          text_size: ICON_TEXT_SIZE,
          color: 0xdddddd,
        });
      }
    };

    redraw();

    let centerTapTimes = [];

    canvas.addEventListener(event.CLICK_UP, (e) => {
      const tx = e.x;
      const ty = e.y;
      const dx = tx - cx;
      const dy = ty - cy;
      const r = Math.hypot(dx, dy);

      if (r < R_INNER) {
        const now = Date.now();
        centerTapTimes.push(now);
        centerTapTimes = centerTapTimes.filter(
          (t) => now - t <= TRIPLE_TAP_WINDOW_MS,
        );
        if (centerTapTimes.length >= 3) {
          page.state.counts = [0, 0, 0, 0];
          centerTapTimes = [];
          logger.debug("triple tap center: counters reset");
          redraw();
        }
        return;
      }

      if (r > R) {
        return;
      }

      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const { cellIndex, delta } = sectorHit(deg);
      let next = page.state.counts[cellIndex] + delta;
      if (delta < 0) {
        next = Math.max(0, next);
      }
      page.state.counts[cellIndex] = next;
      redraw();
    });
  },
  onDestroy() {
    logger.debug("page onDestroy invoked");
  },
});
