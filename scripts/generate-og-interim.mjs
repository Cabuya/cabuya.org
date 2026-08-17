/**
 * Interim OG cards.
 *
 * The full share-card system (per-section art, the illustration pack) is Task
 * 22. Until then the site was still serving the previous project's cards, which
 * is a wrong-brand artefact on every share — worse than a plain one. These are
 * deliberately austere: the mark on Night, the wordmark, nothing invented.
 */
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const NIGHT = '#082a24';
const IVORY = '#f6f3ed';
const FIQUE = '#c79a4a';
const W = 1200;
const H = 630;

const cards = [
  {
    out: 'public/images/og-default-en.jpg',
    line: 'The open aid interoperability protocol',
  },
  {
    out: 'public/images/og-default.jpg',
    line: 'El protocolo abierto de interoperabilidad para ayuda',
  },
];

const lockup = readFileSync('public/images/brand/cabuya-lockup-dark.png');
const lockupWidth = 420;
const lockupHeight = Math.round((lockupWidth * 213) / 640);

for (const card of cards) {
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <rect width="${W}" height="${H}" fill="${NIGHT}"/>
       <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${FIQUE}"/>
       <text x="90" y="${H / 2 + 96}" font-family="Poppins, Helvetica, Arial, sans-serif"
             font-size="40" fill="${IVORY}">${card.line}</text>
       <text x="90" y="${H / 2 + 156}" font-family="Poppins, Helvetica, Arial, sans-serif"
             font-size="28" fill="${FIQUE}">cabuya.org</text>
     </svg>`
  );
  await sharp(overlay)
    .composite([
      {
        input: await sharp(lockup).resize(lockupWidth, lockupHeight).toBuffer(),
        left: 86,
        top: 150,
      },
    ])
    .jpeg({ quality: 88 })
    .toFile(card.out);
  console.log('wrote', card.out);
}
