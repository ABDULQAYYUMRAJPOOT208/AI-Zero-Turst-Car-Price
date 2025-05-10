# backend/rsa_utils.py
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import base64

# Generate and save RSA key pair (one-time operation)
def generate_rsa_key_pair():
    key = RSA.generate(2048)
    private_key = key.export_key()
    public_key = key.publickey().export_key()
    with open("private.pem", "wb") as priv_file:
        priv_file.write(private_key)
    with open("public.pem", "wb") as pub_file:
        pub_file.write(public_key)

# Call this only once
# generate_rsa_key_pair()

# Load keys
def load_keys():
    with open("private.pem", "rb") as f:
        private_key = RSA.import_key(f.read())
    with open("public.pem", "rb") as f:
        public_key = RSA.import_key(open("public.pem", "rb").read())
    return private_key, public_key

# Decrypt the AES key
def decrypt_aes_key(encrypted_key_b64):
    private_key, _ = load_keys()
    cipher_rsa = PKCS1_OAEP.new(private_key)
    encrypted_key = base64.b64decode(encrypted_key_b64)
    return cipher_rsa.decrypt(encrypted_key)

