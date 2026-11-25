import re
import hashlib
from typing import Dict, List, Any, Tuple

class PIISanitizer:
    """
    Enterprise PII (Personally Identifiable Information) detector and redaction engine.
    Ensures HIPAA, GDPR, and SOC2 compliance prior to embedding and indexing text.
    """

    PATTERNS = {
        "SSN": re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
        "CREDIT_CARD": re.compile(r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b'),
        "EMAIL": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'),
        "PHONE": re.compile(r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'),
        "IPV4": re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b'),
        "API_KEY": re.compile(r'\b(?:sk-[a-zA-Z0-9]{20,48}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36})\b')
    }

    @classmethod
    def scan(cls, text: str) -> List[Dict[str, Any]]:
        """Scans text for sensitive identifiers and returns their locations and classifications."""
        findings = []
        if not text:
            return findings

        for pii_type, pattern in cls.PATTERNS.items():
            for match in pattern.finditer(text):
                findings.append({
                    "type": pii_type,
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end()
                })
        return sorted(findings, key=lambda x: x["start"])

    @classmethod
    def redact(cls, text: str, mode: str = "mask") -> Tuple[str, Dict[str, int]]:
        """
        Redacts sensitive PII from text.
        Modes:
          - 'mask': Replaces with [REDACTED:<TYPE>]
          - 'hash': Replaces with [HASH:<SHA256_PREFIX>]
        """
        if not text:
            return "", {}

        counts: Dict[str, int] = {}
        redacted_text = text

        for pii_type, pattern in cls.PATTERNS.items():
            matches = list(pattern.finditer(redacted_text))
            if not matches:
                continue

            counts[pii_type] = len(matches)

            def _replacer(m, p_type=pii_type):
                val = m.group()
                if mode == "hash":
                    short_hash = hashlib.sha256(val.encode("utf-8")).hexdigest()[:8]
                    return f"[HASH:{p_type}_{short_hash}]"
                return f"[REDACTED:{p_type}]"

            redacted_text = pattern.sub(_replacer, redacted_text)

        return redacted_text, counts
