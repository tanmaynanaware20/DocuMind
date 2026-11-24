import pytest
from backend.app.services.ocr_preprocessor import OCRPreprocessor

def test_normalize_ligatures_and_control_chars():
    dirty_text = "The ofﬁcial ﬁnancial report \x00 has been veriﬁed.\x0b\x0c"
    cleaned = OCRPreprocessor.normalize_text(dirty_text)
    assert "official" in cleaned
    assert "financial" in cleaned
    assert "verified" in cleaned
    assert "\x00" not in cleaned

def test_evaluate_ocr_quality_clean():
    clean_text = "Master Subscription Agreement. Section 4 outlines the limitation of liability up to five million dollars."
    eval_res = OCRPreprocessor.evaluate_ocr_quality(clean_text)
    assert eval_res["quality_score"] >= 0.80
    assert eval_res["status"] == "high"
    assert eval_res["word_count"] > 10

def test_evaluate_ocr_quality_noisy():
    noisy_text = "§§§###$$$ %%% 123849 !!! @@@ ### $$$ %%% ^^^"
    eval_res = OCRPreprocessor.evaluate_ocr_quality(noisy_text)
    assert eval_res["quality_score"] < 0.60
    assert eval_res["status"] == "low"
