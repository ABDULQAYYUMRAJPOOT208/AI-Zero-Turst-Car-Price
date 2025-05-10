import forge from "node-forge";

export async function encryptData(data: any, publicKeyPem: string) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const aesKey = forge.random.getBytesSync(32); // 256-bit AES key
  const iv = forge.random.getBytesSync(16); // 128-bit IV
  const jsonString = JSON.stringify(data);
  const buffer = forge.util.createBuffer(jsonString, "utf8");

  // --- ✅ PKCS7 padding ---
  const blockSize = 16;
  const padBytes = blockSize - (buffer.length() % blockSize);
  const padding = String.fromCharCode(padBytes).repeat(padBytes);
  buffer.putBytes(padding);
  // Encrypt the data using AES
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(buffer);
  cipher.finish();
  const encryptedData = forge.util.encode64(cipher.output.getBytes());

  // Encrypt AES key using RSA
  const encryptedKey = forge.util.encode64(
    publicKey.encrypt(aesKey, "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    })
  );

  return {
    encryptedKey,
    encryptedData,
    iv: forge.util.encode64(iv),
  };
}
