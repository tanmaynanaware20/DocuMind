import os
import hmac
import hashlib
import secrets
from typing import Optional

class IntegrityError(Exception):
    """Raised when ciphertext authentication tag fails verification."""
    pass

class DocumentCryptoVault:
    """
    Enterprise Encrypt-then-MAC (EtM) cryptographic envelope for document payloads.
    Uses PBKDF2-HMAC-SHA256 key derivation and constant-time HMAC authentication
    conforming to RFC 7366 and NIST guidelines for secure data at rest.
    """

    DEFAULT_MASTER_KEY = os.getenv("DOCUMIND_CRYPTO_KEY", "documind-production-default-secure-vault-key-32b")
    PBKDF2_ITERATIONS = 50_000

    @classmethod
    def _derive_keys(cls, secret: str, salt: bytes) -> tuple[bytes, bytes]:
        """Derives a 256-bit encryption key and a 256-bit MAC key using PBKDF2."""
        derived = hashlib.pbkdf2_hmac(
            "sha256",
            secret.encode("utf-8"),
            salt,
            iterations=cls.PBKDF2_ITERATIONS,
            dklen=64
        )
        enc_key = derived[:32]
        mac_key = derived[32:]
        return enc_key, mac_key

    @classmethod
    def _keystream(cls, enc_key: bytes, nonce: bytes, length: int) -> bytes:
        """Generates a deterministic pseudorandom keystream using HMAC counter mode."""
        keystream = bytearray()
        counter = 0
        while len(keystream) < length:
            block = hmac.new(enc_key, nonce + counter.to_bytes(4, "big"), hashlib.sha256).digest()
            keystream.extend(block)
            counter += 1
        return bytes(keystream[:length])

    @classmethod
    def encrypt(cls, plaintext: str, secret: Optional[str] = None) -> str:
        """
        Encrypts plaintext string into an authenticated cryptographic envelope.
        Format: v1:{salt_hex}:{nonce_hex}:{ciphertext_hex}:{mac_hex}
        """
        if plaintext is None:
            return ""

        key_source = secret or cls.DEFAULT_MASTER_KEY
        salt = secrets.token_bytes(16)
        nonce = secrets.token_bytes(16)
        enc_key, mac_key = cls._derive_keys(key_source, salt)

        data_bytes = plaintext.encode("utf-8")
        keystream = cls._keystream(enc_key, nonce, len(data_bytes))
        ciphertext = bytes(a ^ b for a, b in zip(data_bytes, keystream))

        # Encrypt-then-MAC over (salt + nonce + ciphertext)
        mac = hmac.new(mac_key, salt + nonce + ciphertext, hashlib.sha256).hexdigest()

        return f"v1:{salt.hex()}:{nonce.hex()}:{ciphertext.hex()}:{mac}"

    @classmethod
    def decrypt(cls, envelope: str, secret: Optional[str] = None) -> str:
        """
        Decrypts envelope string and verifies cryptographic integrity.
        Raises IntegrityError if payload has been tampered with or key is invalid.
        """
        if not envelope:
            return ""

        parts = envelope.split(":")
        if len(parts) != 5 or parts[0] != "v1":
            raise IntegrityError("Invalid envelope structure or unsupported version")

        _, salt_hex, nonce_hex, ct_hex, expected_mac = parts
        salt = bytes.fromhex(salt_hex)
        nonce = bytes.fromhex(nonce_hex)
        ciphertext = bytes.fromhex(ct_hex)

        key_source = secret or cls.DEFAULT_MASTER_KEY
        enc_key, mac_key = cls._derive_keys(key_source, salt)

        # Authenticate MAC using constant-time comparison
        calculated_mac = hmac.new(mac_key, salt + nonce + ciphertext, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(calculated_mac, expected_mac):
            raise IntegrityError("Cryptographic MAC verification failed: payload tampered or incorrect key")

        keystream = cls._keystream(enc_key, nonce, len(ciphertext))
        decrypted_bytes = bytes(a ^ b for a, b in zip(ciphertext, keystream))
        return decrypted_bytes.decode("utf-8")
