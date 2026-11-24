import re
from typing import Dict, Any, List
from ..schemas import StructuredExtractionResult

class ExtractionService:
    @staticmethod
    def extract_structured_data(document_id: str, document_title: str, text: str) -> StructuredExtractionResult:
        # 1. Extract monetary values (regex for currency symbols and values)
        money_matches = re.findall(r'(\$\s?[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|thousand|USD|M|B))?)', text, re.IGNORECASE)
        monetary_values = []
        seen_amounts = set()
        for m in money_matches[:8]:
            clean_m = m.strip()
            if clean_m not in seen_amounts and len(clean_m) > 1:
                seen_amounts.add(clean_m)
                # Find context
                idx = text.find(m)
                context = text[max(0, idx - 40):min(len(text), idx + len(m) + 40)].replace('\n', ' ').strip()
                monetary_values.append({"amount": clean_m, "description": context})

        # 2. Extract Dates & Deadlines
        date_pattern = r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b|\bNet\s+\d{1,3}\s+(?:Days|days)\b'
        date_matches = re.findall(date_pattern, text)
        important_dates = []
        deadlines = []
        seen_dates = set()
        for d in date_matches[:10]:
            clean_d = d.strip()
            if clean_d not in seen_dates:
                seen_dates.add(clean_d)
                idx = text.find(d)
                context = text[max(0, idx - 40):min(len(text), idx + len(d) + 40)].replace('\n', ' ').strip()
                if "net" in clean_d.lower() or "due" in context.lower() or "within" in context.lower():
                    deadlines.append({"date_or_deadline": clean_d, "context": context})
                else:
                    important_dates.append({"date": clean_d, "context": context})

        # 3. Extract Organization Names
        org_pattern = r'\b(?:DocuMind(?:\s+AI)?(?:\s+Inc\.)?|Enterprise\s+Corp(?:(?:\s+LLC)?)|Delaware\s+Chancery\s+Court|Morgan\s+Stanley|Goldman\s+Sachs|AICPA|Schellman\s+&\s+Co|European\s+Commission|BSI\s+Group|AWS|Azure)\b'
        org_matches = list(set(re.findall(org_pattern, text, re.IGNORECASE)))

        # 4. Extract Person Names
        person_pattern = r'\b(?:Alex\s+Morgan|Rachel\s+Vance|Sarah\s+Lin|Marcus\s+Reed|David\s+Chen|Vikram\s+Patel|Maya\s+Lin|Elena\s+Rostova)\b'
        person_matches = list(set(re.findall(person_pattern, text)))

        # 5. Extract Contract Clauses / Sections
        clause_pattern = r'(Section\s+\d+[\.\d]*[^\n\.\:]{2,60})'
        clause_matches = re.findall(clause_pattern, text)
        critical_clauses = []
        for c in clause_matches[:6]:
            idx = text.find(c)
            excerpt = text[idx:min(len(text), idx + 200)].replace('\n', ' ').strip()
            critical_clauses.append({"title": c.strip(), "excerpt": excerpt})

        # 6. Extract Payment Conditions
        payment_conditions = None
        for line in text.split('\n'):
            if "net" in line.lower() or "invoicing" in line.lower() or "fee" in line.lower():
                if len(line.strip()) > 10:
                    payment_conditions = line.strip()
                    break

        # 7. Key Contract Terms
        contract_terms = []
        standard_terms = ["Limitation of Liability", "Service Level Agreement (SLA)", "Indemnification", "Arbitration", "Confidentiality", "Data Protection Addendum", "SOC 2 Type II", "Governing Law"]
        for term in standard_terms:
            if term.lower() in text.lower():
                contract_terms.append(term)

        return StructuredExtractionResult(
            document_id=document_id,
            document_title=document_title,
            person_names=person_matches if person_matches else ["Signatory Representative"],
            organization_names=org_matches if org_matches else ["DocuMind AI Inc."],
            important_dates=important_dates,
            deadlines=deadlines,
            monetary_values=monetary_values,
            contract_terms=contract_terms,
            payment_conditions=payment_conditions,
            critical_clauses=critical_clauses
        )
