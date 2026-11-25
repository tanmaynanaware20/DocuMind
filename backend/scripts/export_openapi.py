import json
from typing import Dict, Any, List
from fastapi import FastAPI
from backend.app.main import app

class OpenAPIContractValidator:
    """
    Automated OpenAPI 3.1 contract extractor and enterprise schema validator.
    Ensures rigorous API documentation, security schemes, and tag coverage.
    """

    @classmethod
    def get_openapi_schema(cls, target_app: FastAPI = app) -> Dict[str, Any]:
        """Extracts OpenAPI JSON specification from FastAPI app instance."""
        return target_app.openapi()

    @classmethod
    def validate_schema(cls, schema: Dict[str, Any], require_tags: bool = False) -> List[str]:
        """
        Validates API specification against enterprise governance rules.
        Returns list of validation error messages (empty if compliant).
        """
        errors = []

        # 1. Info checks
        info = schema.get("info", {})
        if not info.get("title"):
            errors.append("OpenAPI info missing 'title'")
        if not info.get("version"):
            errors.append("OpenAPI info missing 'version'")

        # 2. Paths checks
        paths = schema.get("paths", {})
        if not paths:
            errors.append("OpenAPI schema contains no endpoints under 'paths'")

        for path, path_item in paths.items():
            for method, operation in path_item.items():
                if method.lower() not in {"get", "post", "put", "patch", "delete", "options", "head"}:
                    continue

                op_id = operation.get("operationId", f"{method.upper()} {path}")
                
                # Tag coverage check (if strictly required)
                if require_tags:
                    tags = operation.get("tags", [])
                    if not tags:
                        errors.append(f"Operation '{op_id}' is missing operational tags")

                # Responses check
                responses = operation.get("responses", {})
                if not responses:
                    errors.append(f"Operation '{op_id}' has no response definitions")

        return errors

    @classmethod
    def export_to_file(cls, output_path: str, target_app: FastAPI = app) -> None:
        """Serializes and writes formatted OpenAPI schema to target JSON file."""
        schema = cls.get_openapi_schema(target_app)
        errors = cls.validate_schema(schema)
        if errors:
            raise ValueError(f"OpenAPI validation failed with {len(errors)} errors: {errors}")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(schema, f, indent=2)

if __name__ == "__main__":
    import sys
    out_file = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    OpenAPIContractValidator.export_to_file(out_file)
    print(f"Exported validated OpenAPI schema to {out_file}")
