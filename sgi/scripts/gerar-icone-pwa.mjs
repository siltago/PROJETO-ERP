/**
 * Gera o ícone PWA: gradiente #222831 → #00A6C0 + logo centralizada
 * Uso: node scripts/gerar-icone-pwa.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const INPUT = path.resolve("C:/Users/sms/Downloads/pwa-frame.png");
const OUT_DIR = path.join(root, "public");

// Gradient colors: #222831 (top-left) → #00A6C0 (bottom-right)
const FROM = { r: 0x22, g: 0x28, b: 0x31 };
const TO   = { r: 0x00, g: 0xA6, b: 0xC0 };

async function gradientPng(size) {
  const channels = 4;
  const buf = Buffer.alloc(size * size * channels);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Diagonal gradient (top-left → bottom-right)
      const t = (x + y) / (size * 2 - 2);
      const idx = (y * size + x) * channels;
      buf[idx + 0] = Math.round(FROM.r + (TO.r - FROM.r) * t);
      buf[idx + 1] = Math.round(FROM.g + (TO.g - FROM.g) * t);
      buf[idx + 2] = Math.round(FROM.b + (TO.b - FROM.b) * t);
      buf[idx + 3] = 255;
    }
  }
  return sharp(buf, { raw: { width: size, height: size, channels } }).png().toBuffer();
}

async function makeIcon(size, outFile) {
  // Logo ocupa 80% do ícone, centralizada com padding
  const logoSize = Math.round(size * 0.80);
  const offset   = Math.round((size - logoSize) / 2);

  // Apara o espaço em branco da imagem original, depois redimensiona para 80%
  const logo = await sharp(INPUT)
    .trim({ threshold: 30 })
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const bg = await gradientPng(size);

  await sharp(bg)
    .composite([{ input: logo, top: offset, left: offset, blend: "over" }])
    .png({ compressionLevel: 9 })
    .toFile(outFile);

  console.log(`✓ ${outFile} (${size}×${size})`);
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Arquivo não encontrado: ${INPUT}`);
    process.exit(1);
  }

  // Favicon do site: apara o fundo e deixa transparente
  await sharp(INPUT)
    .trim({ threshold: 30 })
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUT_DIR, "favicon.png"));
  console.log(`✓ public/favicon.png (fundo transparente)`);

  // Ícones PWA com gradiente
  await makeIcon(512, path.join(OUT_DIR, "icon.png"));
  await makeIcon(192, path.join(OUT_DIR, "icon-192.png"));

  console.log("\nícones gerados em public/");
}

main().catch(err => { console.error(err); process.exit(1); });
