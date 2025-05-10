from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# Generate RSA private key
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048  # You can change this to 4096 for stronger security
)

# Serialize and save private key to PEM file
with open("private_key.pem", "wb") as private_file:
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,  # Standard private key format
        encryption_algorithm=serialization.NoEncryption()  # Or use BestAvailableEncryption(b"your_password")
    )
    private_file.write(pem_private)

# Generate corresponding public key
public_key = private_key.public_key()

# Serialize and save public key to PEM file
with open("public_key.pem", "wb") as public_file:
    pem_public = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo  # Standard public key format
    )
    public_file.write(pem_public)

print("RSA key pair generated and saved as 'private_key.pem' and 'public_key.pem'.")
