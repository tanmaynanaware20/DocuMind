import pytest
from backend.app.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pwd = "EnterpriseSecretKey2026!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation_and_decoding():
    data = {"sub": "usr_test_01", "email": "tester@documind.io", "role": "Security Architect"}
    token = create_access_token(data)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.get("sub") == "usr_test_01"
    assert decoded.get("email") == "tester@documind.io"
    assert decoded.get("role") == "Security Architect"

def test_jwt_invalid_token():
    invalid_token = "invalid.token.payload"
    assert decode_access_token(invalid_token) is None
