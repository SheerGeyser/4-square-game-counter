import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export const LABEL_TEXT_SIZE = px(56);
export const COUNTER_TEXT_SIZE = px(44);
export const ICON_TEXT_SIZE = px(28);

/** Базовое расстояние от перекрёстка четвертей к «внутреннему углу» подписи (как раньше INNER_BIAS) */
export const INNER_BIAS = px(36);

export { px };

const W = DEVICE_WIDTH;
const H = DEVICE_HEIGHT;
const halfW = Math.floor(W / 2);
const halfH = Math.floor(H / 2);
const restW = W - halfW;
const restH = H - halfH;
const cx = W / 2;
const cy = H / 2;

// --- 1) Центры букв K, D, V, G (экран, px) ---------------------------------
//
// База: внутренний угол каждой четверти у центра экрана, плюс смещения ниже.
// Правьте LETTER_OFFSET_* если буква визуально уезжает (типично K/V — чуть влево из-за метрик шрифта).
//
export const LETTER_OFFSET_K = { x: 23, y: -2 };
export const LETTER_OFFSET_D = { x: -5, y: -2 };
export const LETTER_OFFSET_V = { x: 23, y: -20 };
export const LETTER_OFFSET_G = { x: -5, y: -20 };

const baseLetterK = { x: halfW - INNER_BIAS, y: halfH - INNER_BIAS };
const baseLetterD = { x: halfW + INNER_BIAS, y: halfH - INNER_BIAS };
const baseLetterV = { x: halfW - INNER_BIAS, y: halfH + INNER_BIAS };
const baseLetterG = { x: halfW + INNER_BIAS, y: halfH + INNER_BIAS };

/** Итоговый центр подписи для drawText (до вычитания половины размера шрифта в page) */
export const LETTER_CENTER_K = {
  x: baseLetterK.x + LETTER_OFFSET_K.x,
  y: baseLetterK.y + LETTER_OFFSET_K.y,
};
export const LETTER_CENTER_D = {
  x: baseLetterD.x + LETTER_OFFSET_D.x,
  y: baseLetterD.y + LETTER_OFFSET_D.y,
};
export const LETTER_CENTER_V = {
  x: baseLetterV.x + LETTER_OFFSET_V.x,
  y: baseLetterV.y + LETTER_OFFSET_V.y,
};
export const LETTER_CENTER_G = {
  x: baseLetterG.x + LETTER_OFFSET_G.x,
  y: baseLetterG.y + LETTER_OFFSET_G.y,
};

export const LETTER_CENTERS = [
  LETTER_CENTER_K,
  LETTER_CENTER_D,
  LETTER_CENTER_V,
  LETTER_CENTER_G,
];

// --- 2) Счётчики: «удалённость» от центра экрана ---------------------------
//
// Позиция счётчика = центр четверти, сдвинутая к центру экрана на долю
// COUNTER_BLEND_TOWARD_SCREEN_CENTER (0 = остаётся в центре четверти, 1 = в центре экрана),
// затем глобальный сдвиг COUNTER_GLOBAL_OFFSET.
//
export const COUNTER_BLEND_TOWARD_SCREEN_CENTER = 0.25;

/** Сдвиг всех счётчиков одним вектором (px), после blend */
export const COUNTER_GLOBAL_OFFSET = { x: 0, y: 0 };

const quarterCenters = [
  { x: halfW / 2, y: halfH / 2 },
  { x: halfW + restW / 2, y: halfH / 2 },
  { x: halfW / 2, y: halfH + restH / 2 },
  { x: halfW + restW / 2, y: halfH + restH / 2 },
];

/** Центры цифр счётчика (после blend и global offset) — для отрисовки */
export const COUNTER_CENTERS = quarterCenters.map((qc) => ({
  x:
    qc.x +
    (cx - qc.x) * COUNTER_BLEND_TOWARD_SCREEN_CENTER +
    COUNTER_GLOBAL_OFFSET.x,
  y:
    qc.y +
    (cy - qc.y) * COUNTER_BLEND_TOWARD_SCREEN_CENTER +
    COUNTER_GLOBAL_OFFSET.y,
}));
