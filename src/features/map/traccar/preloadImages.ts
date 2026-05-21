import greenCar from "../../../assets/green_car.png";
import redCar from "../../../assets/red_car.png";
import greyCar from "../../../assets/grey_car.png";

export const mapImages: Record<string, HTMLImageElement | ImageData> = {};

const supportedCategories = ["default", "car", "bus"] as const;
const supportedColors = ["info", "success", "error", "neutral"] as const;

const palette: Record<(typeof supportedColors)[number], string> = {
  info: "#0288D1",
  success: "#2E7D32",
  error: "#D32F2F",
  neutral: "#9E9E9E",
};

const createCircleImage = (size: number, fillColor: string, strokeColor = "#FFFFFF") => {
  const ratio = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.scale(ratio, ratio);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1.5;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.arc(cx, cy + 1.5, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const createDirectionImage = (size: number, color = "#4A4A4A") => {
  const ratio = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.scale(ratio, ratio);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size / 2, 6);
  ctx.lineTo(size - 6, size - 6);
  ctx.lineTo(6, size - 6);
  ctx.closePath();
  ctx.fill();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

export const mapIconKey = (category?: string | null) => {
  switch (category) {
    case "offroad":
    case "pickup":
      return "car";
    case "trolleybus":
      return "bus";
    default:
      return supportedCategories.includes((category || "default") as any)
        ? (category || "default")
        : "default";
  }
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export default async function preloadImages() {
  mapImages.background = createCircleImage(48, palette.neutral);
  mapImages.direction = createDirectionImage(32);

  try {
    const [greenImg, redImg, greyImg] = await Promise.all([
      loadImage(greenCar),
      loadImage(redCar),
      loadImage(greyCar),
    ]);

    supportedCategories.forEach((category) => {
      mapImages[`${category}-success`] = greenImg;
      mapImages[`${category}-info`] = greenImg; // Using green for info as well, or you can provide a blue car
      mapImages[`${category}-error`] = redImg;
      mapImages[`${category}-neutral`] = greyImg;
    });
  } catch (error) {
    console.error("Failed to load car images", error);
    // Fallback to circles if images fail to load
    supportedCategories.forEach((category) => {
      supportedColors.forEach((color) => {
        mapImages[`${category}-${color}`] = createCircleImage(36, palette[color]);
      });
    });
  }
}


