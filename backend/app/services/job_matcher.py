import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

class JobMatcherService:
    @staticmethod
    def calculate_match_score(resume_text: str, job_text: str) -> float:
        try:
            resume_emb = GeminiService.generate_embeddings(resume_text)
            job_emb = GeminiService.generate_embeddings(job_text)
            
            a = np.array(resume_emb)
            b = np.array(job_emb)
            score = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
            
            final_score = max(0.0, min(100.0, float(score * 100)))
            return final_score
        except Exception as e:
            logger.warning(f"Embedding match failed, falling back to TF-IDF: {e}")
            return JobMatcherService._tfidf_fallback(resume_text, job_text)

    @staticmethod
    def _tfidf_fallback(resume_text: str, job_text: str) -> float:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return max(0.0, min(100.0, float(score * 100)))
