import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class HyDEService:
    """
    Hypothetical Document Embeddings (HyDE) expansion service.
    Improves dense vector retrieval recall on short or ambiguous enterprise questions
    by generating domain-adapted hypothetical document passages before embedding.
    """

    DOMAIN_TEMPLATES = {
        "legal": "In accordance with standard enterprise agreement provisions and governing law, regarding '{query}', the agreement specifies the obligations, covenants, liabilities, and enforceable terms as follows:",
        "financial": "Based on standard audit, fiscal reporting, and balance sheet disclosures regarding '{query}', the financial figures, amortization schedules, and EBITDA reconciliations reflect that:",
        "compliance": "Per regulatory standards (SOC2, GDPR, HIPAA, ISO27001) addressing '{query}', the entity enforces strict controls, encryption policies, and data processing safeguards stating:",
        "technical": "According to the architectural specifications and system runbooks concerning '{query}', the component utilizes distributed protocols, failover boundaries, and latency limits defined as:",
        "general": "Regarding the subject of '{query}', standard organizational records and operational documentation establish that:"
    }

    @classmethod
    def expand_query(cls, query: str, domain: str = "general") -> Dict[str, str]:
        """
        Generates a synthetic hypothetical passage representing what an ideal document
        answering the user query would say.
        """
        if not query or not query.strip():
            return {
                "original_query": "",
                "domain": domain,
                "hypothetical_document": "",
                "search_text": ""
            }

        clean_query = query.strip()
        template = cls.DOMAIN_TEMPLATES.get(domain.lower(), cls.DOMAIN_TEMPLATES["general"])
        hypothetical = template.format(query=clean_query)

        # Combined representation for dense hybrid search
        search_text = f"{clean_query} {hypothetical}"

        return {
            "original_query": clean_query,
            "domain": domain,
            "hypothetical_document": hypothetical,
            "search_text": search_text
        }

    @classmethod
    def detect_domain(cls, query: str) -> str:
        """Heuristically infers query domain if not explicitly provided."""
        q = query.lower()
        if any(w in q for w in ["clause", "agreement", "liability", "breach", "indemnity", "termination", "party"]):
            return "legal"
        if any(w in q for w in ["revenue", "ebitda", "margin", "fiscal", "expense", "budget", "tax", "balance"]):
            return "financial"
        if any(w in q for w in ["gdpr", "hipaa", "soc2", "compliance", "audit", "security", "pii"]):
            return "compliance"
        if any(w in q for w in ["api", "latency", "docker", "service", "database", "endpoint", "architecture"]):
            return "technical"
        return "general"
