export async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
    // Remove headers/footers and whitespace
    const b64 = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
  
    const binaryDer = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
  
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
  }
  
  export async function encryptDataWithRSA(data: any, publicKey: CryptoKey): Promise<string> {
    console.log('Encrypting data with RSA...', publicKey, data);
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    console.log('Encoded data: before encrypting', encoded);
  
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded
    );
  console.log('Encrypted data: after encrypting', encrypted);
    // Convert to base64 string
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
  