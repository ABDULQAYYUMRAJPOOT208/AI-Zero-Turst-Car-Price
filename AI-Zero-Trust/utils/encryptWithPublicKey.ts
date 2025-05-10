function stringToBigInt(str: string): bigint {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) + BigInt(byte);
  }
  return result;
}

function bigIntToBase64(bn: bigint): string {
  const hex = bn.toString(16);
  const hexPadded = hex.length % 2 ? "0" + hex : hex;
  const bytes = hexPadded.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) ?? [];
  const uint8 = Uint8Array.from(bytes);
  return btoa(String.fromCharCode(...uint8));
}

function base64UrlToBigInt(base64url: string): bigint {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  let result = 0n;
  for (let i = 0; i < binary.length; i++) {
    result = (result << 8n) + BigInt(binary.charCodeAt(i));
  }
  return result;
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent >>= 1n;
    base = (base * base) % modulus;
  }
  return result;
}

function encryptWithModulusExponent(
  message: string,
  n: bigint,
  e: bigint
): string {
  const m = stringToBigInt(message);
  if (m >= n) throw new Error("Message is too long for the RSA key.");
  const c = modPow(m, e, n); // 👈 Use safe modular exponentiation
  return bigIntToBase64(c);
}
