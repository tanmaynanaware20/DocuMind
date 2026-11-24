import re
from typing import Dict, Any

class OCRPreprocessor:
    """
    OCR text cleaning, ligature normalization, and quality scoring pipeline.
    Ensures high-fidelity ingestion for scanned enterprise documents.
    """

    LIGATURES = {
        'ﬁ': 'fi',
        'ﬂ': 'fl',
        'ﬀ': 'ff',
        'ﬃ': 'ffi',
        'ﬄ': 'ffl',
        'æ': 'ae',
        'œ': 'oe',
        '–': '-',
        '—': '-',
        '“': '"',
        '”': '"',
        '‘': "'",
        '’': "'"
    }

    @classmethod
    def normalize_text(cls, text: str) -> str:
        """Normalizes Unicode ligatures, quotes, and non-printable control characters."""
        if not text:
            return ""

        # Replace ligatures
        for lig, repl in cls.LIGATURES.items():
            text = text.replace(lig, repl)

        # Remove non-printable control characters except newline and tab
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)

        # Collapse excessive whitespace
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    @classmethod
    def evaluate_ocr_quality(cls, text: str) -> Dict[str, Any]:
        """
        Evaluates extracted OCR text quality based on alphabetic density,
        word lengths, and special character anomaly ratios.
        """
        if not text:
            return {"quality_score": 0.0, "status": "empty", "word_count": 0}

        words = re.findall(r'\b[a-zA-Z]{2,}\b', text)
        total_tokens = len(text.split())
        chars = len(text)
        alpha_chars = sum(1 for c in text if c.isalpha())
        symbols = sum(1 for c in text if not c.isalnum() and not c.isspace())

        alpha_ratio = alpha_chars / max(1, chars)
        symbol_ratio = symbols / max(1, chars)

        # High quality text has alpha_ratio >= 0.70 and symbol_ratio <= 0.15
        quality_score = max(0.10, min(1.0, (alpha_ratio * 0.8) - (symbol_ratio * 0.5) + 0.25))

        return {
            "quality_score": round(quality_score, 2),
            "status": "high" if quality_score >= 0.80 else "medium" if quality_score >= 0.60 else "low",
            "word_count": len(words),
            "total_tokens": total_tokens,
            "alpha_ratio": round(alpha_ratio, 2),
            "symbol_ratio": round(symbol_ratio, 2)
        }
