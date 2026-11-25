import pytest
from backend.app.services.crypto_vault import DocumentCryptoVault, IntegrityError

def test_encrypt_and_decrypt_roundtrip():
    secret = "test-tenant-encryption-key-2026"
    plaintext = "Confidential Master Service Agreement regarding enterprise software licensing."

    envelope = DocumentCryptoVault.encrypt(plaintext, secret=secret)
    assert envelope.startswith("v1:")

    decrypted = DocumentCryptoVault.decrypt(envelope, secret=secret)
    assert decrypted == plaintext

def test_tamper_detection():
    secret = "tamper-proof-secret"
    plaintext = "Sensitive financial audit statements."
    envelope = DocumentCryptoVault.encrypt(plaintext, secret=secret)

    # Flip one character in the ciphertext section
    parts = envelope.split(":")
    tampered_ct = ("f" if parts[3][0] != "f" else "0") + parts[3][1:]
    tampered_envelope = f"{parts[0]}:{parts[1]}:{parts[2]}:{tampered_ct}:{parts[4]}"

    with pytest.raises(IntegrityError):
        DocumentCryptoVault.decrypt(tampered_envelope, secret=secret)

def test_wrong_key_fails_authentication():
    envelope = DocumentCryptoVault.encrypt("Top secret memorandum", secret="correct-key")

    with pytest.raises(IntegrityError):
        DocumentCryptoVault.decrypt(envelope, secret="wrong-key")
