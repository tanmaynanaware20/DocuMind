import os
import io
import re
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF
import docx
import pandas as pd
import openpyxl

class DocumentExtractionResult:
    def __init__(self, raw_text: str, pages: List[Dict[str, Any]], word_count: int, page_count: int):
        self.raw_text = raw_text
        self.pages = pages  # list of {"page_number": int, "text": str}
        self.word_count = word_count
        self.page_count = page_count

class DocumentProcessor:
    """
    Multi-format document processing engine implementing PyMuPDF, python-docx,
    and pandas/openpyxl extraction pipelines.
    """

    @staticmethod
    def extract_pdf(file_path_or_bytes) -> DocumentExtractionResult:
        doc = fitz.open(stream=file_path_or_bytes, filetype="pdf") if isinstance(file_path_or_bytes, bytes) else fitz.open(file_path_or_bytes)
        pages = []
        full_text_parts = []

        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            pages.append({
                "page_number": page_idx + 1,
                "text": page_text
            })
            if page_text:
                full_text_parts.append(f"--- Page {page_idx + 1} ---\n{page_text}")

        raw_text = "\n\n".join(full_text_parts)
        words = len(re.findall(r'\b\w+\b', raw_text))
        return DocumentExtractionResult(raw_text, pages, words, len(pages))

    @staticmethod
    def extract_docx(file_path_or_bytes) -> DocumentExtractionResult:
        file_obj = io.BytesIO(file_path_or_bytes) if isinstance(file_path_or_bytes, bytes) else file_path_or_bytes
        doc = docx.Document(file_obj)

        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(f"[Table Row]: {row_text}")

        raw_text = "\n\n".join(paragraphs)
        words = len(re.findall(r'\b\w+\b', raw_text))
        estimated_pages = max(1, round(words / 400))
        pages = [{"page_number": i + 1, "text": p} for i, p in enumerate(paragraphs[:estimated_pages])]
        if not pages:
            pages = [{"page_number": 1, "text": raw_text}]

        return DocumentExtractionResult(raw_text, pages, words, estimated_pages)

    @staticmethod
    def extract_excel(file_path_or_bytes, ext: str = "xlsx") -> DocumentExtractionResult:
        file_obj = io.BytesIO(file_path_or_bytes) if isinstance(file_path_or_bytes, bytes) else file_path_or_bytes
        
        if ext == "csv":
            df = pd.read_csv(file_obj)
            summary_text = df.to_string(max_rows=150)
            raw_text = f"Spreadsheet Data (CSV):\nColumns: {', '.join(df.columns)}\nRows: {len(df)}\n\nSample Records:\n{summary_text}"
            words = len(re.findall(r'\b\w+\b', raw_text))
            pages = [{"page_number": 1, "text": raw_text}]
            return DocumentExtractionResult(raw_text, pages, words, 1)
        else:
            excel_file = pd.ExcelFile(file_obj)
            pages = []
            full_text_parts = []
            for idx, sheet_name in enumerate(excel_file.sheet_names):
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                sheet_text = f"Sheet: {sheet_name}\nColumns: {', '.join(str(c) for c in df.columns)}\nTotal Rows: {len(df)}\n"
                sheet_text += df.head(100).to_string()
                pages.append({"page_number": idx + 1, "text": sheet_text})
                full_text_parts.append(sheet_text)

            raw_text = "\n\n".join(full_text_parts)
            words = len(re.findall(r'\b\w+\b', raw_text))
            return DocumentExtractionResult(raw_text, pages, words, max(1, len(pages)))

    @staticmethod
    def extract_text(file_path_or_bytes) -> DocumentExtractionResult:
        if isinstance(file_path_or_bytes, bytes):
            raw_text = file_path_or_bytes.decode('utf-8', errors='replace')
        else:
            with open(file_path_or_bytes, 'r', encoding='utf-8', errors='replace') as f:
                raw_text = f.read()

        words = len(re.findall(r'\b\w+\b', raw_text))
        pages = [{"page_number": 1, "text": raw_text}]
        return DocumentExtractionResult(raw_text, pages, words, 1)

    @classmethod
    def process_file(cls, filename: str, content_bytes: bytes) -> DocumentExtractionResult:
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext == 'pdf':
            return cls.extract_pdf(content_bytes)
        elif ext in ('docx', 'doc'):
            return cls.extract_docx(content_bytes)
        elif ext in ('xlsx', 'xls', 'csv'):
            return cls.extract_excel(content_bytes, ext)
        else:
            return cls.extract_text(content_bytes)

    @staticmethod
    def is_table_content(text: str) -> bool:
        """
        Detects if a paragraph or text block represents a structured table
        (markdown pipe table, tab/CSV delimited, or DOCX [Table Row] format).
        """
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if not lines:
            return False
        
        table_indicators = 0
        for line in lines:
            if line.startswith('|') and line.endswith('|'):
                table_indicators += 1
            elif line.startswith('[Table Row]:'):
                table_indicators += 1
            elif ' | ' in line and len(line.split(' | ')) >= 3:
                table_indicators += 1
            elif '\t' in line and len(line.split('\t')) >= 3:
                table_indicators += 1
        
        return table_indicators >= max(1, len(lines) // 2)

    @classmethod
    def chunk_document(
        cls,
        raw_text: str,
        pages: List[Dict[str, Any]],
        target_tokens: int = 512,
        overlap: int = 50,
        strategy: str = "table_aware",
        preserve_tables: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Advanced layout-aware semantic and sliding-window chunker preserving
        page numbers, paragraph context, and tabular structural integrity.
        """
        chunks = []
        chunk_idx = 0

        # Chunk page by page to guarantee strict page citations
        for page_obj in pages:
            p_num = page_obj.get("page_number", 1)
            p_text = page_obj.get("text", "")
            if not p_text.strip():
                continue

            # Split on paragraph or newline boundaries
            paragraphs = [p.strip() for p in p_text.split('\n\n') if p.strip()]
            current_chunk_words: List[str] = []
            has_table_in_chunk = False

            for para in paragraphs:
                is_table = cls.is_table_content(para) if preserve_tables else False
                words = para.split()
                if not words:
                    continue

                # If paragraph is a table and preserve_tables is True, treat as atomic if it fits
                if is_table:
                    # If existing buffer has content, flush it first to avoid mixing prose and tabular boundaries
                    if current_chunk_words:
                        chunk_text = " ".join(current_chunk_words)
                        chunks.append({
                            "chunk_index": chunk_idx,
                            "page_number": p_num,
                            "content": chunk_text,
                            "token_count": len(current_chunk_words),
                            "metadata": {
                                "page_number": p_num,
                                "is_table": has_table_in_chunk,
                                "strategy": strategy,
                                "has_overlap": len(current_chunk_words) > len(words)
                            }
                        })
                        chunk_idx += 1
                        current_chunk_words = []
                        has_table_in_chunk = False

                    # Emit table block with dedicated metadata
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "page_number": p_num,
                        "content": para,
                        "token_count": len(words),
                        "metadata": {
                            "page_number": p_num,
                            "is_table": True,
                            "strategy": strategy,
                            "has_overlap": False
                        }
                    })
                    chunk_idx += 1
                    continue

                # Standard semantic chunking with overlap
                if len(current_chunk_words) + len(words) > target_tokens and current_chunk_words:
                    chunk_text = " ".join(current_chunk_words)
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "page_number": p_num,
                        "content": chunk_text,
                        "token_count": len(current_chunk_words),
                        "metadata": {
                            "page_number": p_num,
                            "is_table": has_table_in_chunk,
                            "strategy": strategy,
                            "has_overlap": True
                        }
                    })
                    chunk_idx += 1
                    # retain overlap
                    overlap_slice = current_chunk_words[-overlap:] if overlap > 0 else []
                    current_chunk_words = overlap_slice + words
                    has_table_in_chunk = False
                else:
                    current_chunk_words.extend(words)

            if current_chunk_words:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "page_number": p_num,
                    "content": " ".join(current_chunk_words),
                    "token_count": len(current_chunk_words),
                    "metadata": {
                        "page_number": p_num,
                        "is_table": has_table_in_chunk,
                        "strategy": strategy,
                        "has_overlap": False
                    }
                })
                chunk_idx += 1

        return chunks
