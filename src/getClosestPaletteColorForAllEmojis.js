import PALETTE from "./palette.json";
// https://github.com/github/gemoji/blob/master/db/emoji.json
import emojiJson from "./emoji.json";
import { getPalette } from "./getPalette";

const emojiList = emojiJson.map((obj) => obj.emoji);

const getAvgHex = (color, total) =>
  Math.round(color / total)
    .toString(16)
    .padStart(2, 0);

const getEmojiAvgColor = (emoji, canvas) => {
  let totalPixels = 0;
  const colors = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  };
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "30px Arial";
  ctx.fillText(emoji, 15 /* x */, 28 /* y */);
  const { data: imageData } = ctx.getImageData(0, 0, 60, 60);
  for (let i = 0; i < imageData.length; i += 4) {
    let [r, g, b, a] = imageData.slice(i, i + 4);
    if (a > 50) {
      totalPixels += 1;
      colors.red += r;
      colors.green += g;
      colors.blue += b;
      colors.alpha += a;
    }
  }
  const r = parseInt(getAvgHex(colors.red, totalPixels), 16);
  const g = parseInt(getAvgHex(colors.green, totalPixels), 16);
  const b = parseInt(getAvgHex(colors.blue, totalPixels), 16);

  return { r, g, b };
};

// Distance between 2 colors (in RGB)
// https://stackoverflow.com/questions/23990802/find-nearest-color-from-a-colors-list
function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

// from https://stackoverflow.com/a/5624139
function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

const PALETTE_RGB = PALETTE.map((c) => hexToRgb(c)).filter(
  (rgb) => rgb != null
);

const MAX_GRAY_DISTANCE = 32;
const BLACK_DISTANCE = 70;

const getClosestColorFromPalette = ({ r, g, b }) => {
  var lowest = Number.POSITIVE_INFINITY;
  var tmp;
  let index = 0;
  const blackRgb = hexToRgb("#000000");
  const blackDistance = distance({ r, g, b }, blackRgb);
  if (blackDistance <= BLACK_DISTANCE) {
    return PALETTE[11]; // gray
  }
  PALETTE_RGB.forEach((paletteRgbColor, i) => {
    tmp = distance({ r, g, b }, paletteRgbColor);
    if (tmp < lowest) {
      if (i === 11) {
        // check that the distance is close before picking gray
        if (tmp <= MAX_GRAY_DISTANCE) {
          lowest = tmp;
          index = i;
        }
      } else {
        lowest = tmp;
        index = i;
      }
    }
  });
  return PALETTE[index];
};

export const getClosestPaletteColorForAllEmojis = () => {
  // const canvas = document.createElement("canvas");
  return emojiList.reduce(function (acc, emoji) {
    // acc[emoji] = getClosestColorFromPalette(getEmojiAvgColor(emoji, canvas));
    const [r, g, b] = getPalette(emoji, 5)[0];
    acc[emoji] = getClosestColorFromPalette({ r, g, b });
    return acc;
  }, {});
};
