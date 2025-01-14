import quantize from "@lokesh.dhakar/quantize";

// https://github.com/lokesh/color-thief/blob/master/src/color-thief.js

function createPixelArray(imgData) {
  const pixels = imgData;
  const pixelArray = [];

  for (let i = 0; i < pixels.length; i += 4) {
    let [r, g, b, a] = pixels.slice(i, i + 4);

    // If pixel is mostly opaque and not white
    if (a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b]);
      }
    }
  }
  return pixelArray;
}

export function getPalette(emoji, colorCount, quality) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = "30px Arial";
  ctx.fillText(emoji, 15, 28);
  const { data: imageData } = ctx.getImageData(0, 0, 60, 60);

  const pixelArray = createPixelArray(imageData);

  // Send array to quantize function which clusters values
  // using median cut algorithm
  const cmap = quantize(
    pixelArray,
    colorCount != null ? Math.min(Math.max(colorCount, 2), 10) : 2
  );
  const palette = cmap ? cmap.palette() : null;
  console.log(palette);

  return palette;
}
