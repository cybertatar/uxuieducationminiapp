/** Кодировщик из jpeg-js без декодера: у пакета нет своих типов */
declare module 'jpeg-js/lib/encoder.js' {
  export default function encode(
    image: { data: Uint8ClampedArray | Uint8Array; width: number; height: number },
    quality?: number,
  ): { data: Uint8Array; width: number; height: number };
}
