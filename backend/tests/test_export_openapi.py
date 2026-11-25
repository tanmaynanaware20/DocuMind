import pytest
from backend.scripts.export_openapi import OpenAPIContractValidator
from backend.app.main import app

def test_openapi_schema_generation():
    schema = OpenAPIContractValidator.get_openapi_schema(app)
    assert schema["info"]["title"] == "DocuMind API"
    assert "paths" in schema
    assert "/api/health" in schema["paths"]
    assert "/api/health/live" in schema["paths"]
    assert "/api/health/ready" in schema["paths"]

def test_openapi_contract_validation():
    schema = OpenAPIContractValidator.get_openapi_schema(app)
    errors = OpenAPIContractValidator.validate_schema(schema)
    assert errors == []

def test_invalid_schema_catches_missing_info():
    bad_schema = {"openapi": "3.1.0", "paths": {}}
    errors = OpenAPIContractValidator.validate_schema(bad_schema)
    assert any("title" in e for e in errors)
    assert any("paths" in e for e in errors)
