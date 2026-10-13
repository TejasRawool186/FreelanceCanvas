import hashlib
import math
import os
from pathlib import Path
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from ..config import settings

class PortfolioVectorStore:
    def __init__(self):
        self.client = QdrantClient(path=str(settings.QDRANT_PATH))
        self._init_collection()

    def _init_collection(self):
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == settings.QDRANT_COLLECTION for c in collections)
            if not exists:
                self.client.create_collection(
                    collection_name=settings.QDRANT_COLLECTION,
                    vectors_config=qmodels.VectorParams(size=128, distance=qmodels.Distance.COSINE)
                )
        except Exception as e:
            print(f"[Qdrant Init Warning]: {e}")

    @staticmethod
    def _pseudo_embed(text: str) -> List[float]:
        vec = [0.0] * 128
        words = text.lower().split()
        for idx, word in enumerate(words):
            h = int(hashlib.md5(word.encode()).hexdigest(), 16)
            for d in range(128):
                vec[d] += math.sin((h >> (d % 32)) + d)
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]

    def add_case_study(self, doc_id: str, title: str, content: str, tech_stack: List[str]):
        vec = self._pseudo_embed(f"{title} {content} {' '.join(tech_stack)}")
        self.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=[
                qmodels.PointStruct(
                    id=abs(hash(doc_id)) % 9223372036854775807,
                    vector=vec,
                    payload={
                        "doc_id": doc_id,
                        "title": title,
                        "content": content,
                        "tech_stack": tech_stack
                    }
                )
            ]
        )

    def search_relevant_experience(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        vec = self._pseudo_embed(query)
        try:
            if hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=settings.QDRANT_COLLECTION,
                    query=vec,
                    limit=limit
                )
                return [p.payload for p in response.points if p.payload]
            elif hasattr(self.client, "search"):
                hits = self.client.search(
                    collection_name=settings.QDRANT_COLLECTION,
                    query_vector=vec,
                    limit=limit
                )
                return [hit.payload for hit in hits if hit.payload]
        except Exception as e:
            print(f"[Qdrant Search Warning]: {e}")

        try:
            records, _ = self.client.scroll(
                collection_name=settings.QDRANT_COLLECTION,
                limit=limit,
                with_payload=True
            )
            return [r.payload for r in records if r.payload]
        except Exception:
            return []

# Vector collection index verification

# Payload indexing for fast filtering
