import logging
import time
import traceback
from typing import Callable, Any
from google import genai
from google.genai import errors
from app.core.config import settings
from app.schemas.analysis import GeminiStructuredOutput
from app.core.exceptions import GeminiAPIException

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Service for Gemini API integration to analyze resumes and job descriptions.
    Implements dynamic model listing, exponential backoff, error handling, and model fallbacks.
    """
    
    @staticmethod
    def _clean_json(text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    @staticmethod
    def _execute_with_fallback(api_call_func: Callable[[genai.Client, str], Any], preferred_models=None) -> Any:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise GeminiAPIException(401, "Invalid API Key", "The configured Gemini API key is missing or invalid.")

        client = genai.Client(api_key=api_key)
        
        is_embedding = False
        if preferred_models is None:
            preferred_models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        elif any("embedding" in m for m in preferred_models):
            is_embedding = True

        # Automatically list available models and filter by supported_generation_methods if available
        try:
            available_models = []
            for m in client.models.list():
                name = m.name.replace("models/", "")
                methods = getattr(m, 'supported_generation_methods', [])
                if methods:
                    target_method = 'embedContent' if is_embedding else 'generateContent'
                    if target_method in methods:
                        available_models.append(name)
                else:
                    # If methods list is empty (API behavior changes), append all to filter by name later
                    available_models.append(name)
            logger.info(f"Dynamically discovered {len(available_models)} models from API.")
        except Exception as e:
            logger.warning(f"Could not list models dynamically: {e}. Using defaults.")
            available_models = []

        # Find which preferred models are actually available
        models_to_try = [m for m in preferred_models if m in available_models]
        
        # Fallback to ANY supported model if preferred models are missing
        if not models_to_try and available_models:
            keyword = 'embedding' if is_embedding else 'flash'
            fallback_models = [m for m in available_models if keyword in m]
            if fallback_models:
                models_to_try = fallback_models
            elif not is_embedding:
                # If no 'flash' model, try finding any model with 'pro'
                fallback_models = [m for m in available_models if 'pro' in m]
                if fallback_models:
                    models_to_try = fallback_models
                
        # Final desperation fallback
        if not models_to_try:
            models_to_try = preferred_models

        backoff_delays = [1, 2, 4]
        last_exception = None
        last_code = None
        
        for model in models_to_try:
            retries = 0
            while retries <= len(backoff_delays):
                try:
                    logger.info(f"Attempting Gemini API call with model: {model} (Retry: {retries})")
                    return api_call_func(client, model)
                except (errors.APIError, errors.ClientError) as e:
                    last_exception = str(e)
                    logger.error(f"Gemini API Error with model {model}:\nException: {e}\nTraceback:\n{traceback.format_exc()}")
                    
                    code = getattr(e, 'code', None)
                    if code is None and hasattr(e, 'message') and '429' in str(e.message):
                        code = 429
                        
                    last_code = code
                        
                    if code == 429 or "RESOURCE_EXHAUSTED" in str(e).upper() or "429" in str(e):
                        if retries < len(backoff_delays):
                            delay = backoff_delays[retries]
                            logger.warning(f"Quota/Rate Limit (429) for {model}. Retrying in {delay}s...")
                            time.sleep(delay)
                            retries += 1
                        else:
                            logger.warning(f"Exhausted 429 retries for {model}. Trying next model.")
                            break # Break while loop, continue to next model
                    elif code == 404:
                        logger.warning(f"Model {model} NOT FOUND (404). Trying next model.")
                        break # Try next model
                    elif code == 400:
                        logger.warning(f"Bad Request (400) for {model}. It may not support this feature. Trying next model.")
                        break # Try next model
                    elif code == 408 or "timeout" in str(e).lower():
                        raise GeminiAPIException(408, "Request Timeout", "The AI service took too long to respond.")
                    elif code in [401, 403] or "API key not valid" in str(e).lower():
                        raise GeminiAPIException(401, "Invalid API Key", "The configured Gemini API key is invalid or lacks permissions.")
                    else:
                        logger.warning(f"Unhandled API error {code} for {model}. Trying next model.")
                        break # Try next model
                        
                except Exception as e:
                    # For anything that isn't a direct GenAI APIError/ClientError (e.g. JSON validation)
                    logger.error(f"Unexpected Exception with model {model}:\n{e}\nTraceback:\n{traceback.format_exc()}")
                    
                    # If it's a Pydantic Validation Error, we don't retry models for this.
                    # If it's a network issue (like ConnectionError), maybe we should retry.
                    # We will fail fast here to avoid confusing internal errors with API quotas.
                    raise GeminiAPIException(503, "AI Service Unavailable", f"An unexpected internal error occurred: {e}")
                    
        # If we exhaust all models, evaluate the last exception to determine the true failure cause
        if last_code == 429 or (last_exception and ("429" in last_exception or "RESOURCE_EXHAUSTED" in last_exception.upper())):
            raise GeminiAPIException(429, "Gemini quota exceeded.", "Daily API limit reached. Please try again later or configure a new API key.")
        elif last_exception:
            raise GeminiAPIException(503, "AI Service Unavailable", f"All fallback models failed. Last error: {last_exception}")
        else:
            raise GeminiAPIException(503, "AI Service Unavailable", "No valid models were available to process the request.")

    @staticmethod
    def analyze_resume(resume_text: str) -> GeminiStructuredOutput:
        prompt = f"""
        You are an expert AI Resume Analyst, Career Coach, and ATS Scoring Engine.
        Analyze the following resume text and extract the required information, 
        categorize the skills, and provide detailed ATS feedback including interview readiness, career advice, and an overall rating out of 10.
        
        Resume Text:
        {resume_text}
        """
        
        def _call(client, model_name):
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiStructuredOutput,
                ),
            )
            return GeminiStructuredOutput.model_validate_json(GeminiService._clean_json(response.text))
            
        return GeminiService._execute_with_fallback(_call)

    @staticmethod
    def generate_embeddings(text: str) -> list[float]:
        def _call(client, model_name):
            response = client.models.embed_content(
                model=model_name,
                contents=text,
            )
            return response.embeddings[0].values
            
        return GeminiService._execute_with_fallback(_call, preferred_models=['text-embedding-004', 'gemini-embedding-001', 'gemini-embedding-2'])

    @staticmethod
    def extract_job_details(job_text: str):
        from app.schemas.intelligence import JobDescriptionExtractionSchema
        prompt = f"Extract the company name, required skills, required experience, and educational requirements from the following job description:\n\n{job_text}"
        
        def _call(client, model_name):
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=JobDescriptionExtractionSchema,
                )
            )
            return JobDescriptionExtractionSchema.model_validate_json(GeminiService._clean_json(response.text))
            
        return GeminiService._execute_with_fallback(_call)

    @staticmethod
    def generate_detailed_match(resume_text: str, job_text: str):
        from app.schemas.intelligence import JobMatchDetailedSchema
        prompt = f"Compare the resume to the job description. Generate an overall ATS match score (0-100), and specific sub-scores for skill_match, experience_match, education_match, and project_match (0-100). Also list matching and missing skills, suggest courses to bridge gaps, provide a learning timeline, and detail strengths/weaknesses for this role.\n\nResume: {resume_text}\nJob: {job_text}"
        
        def _call(client, model_name):
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=JobMatchDetailedSchema,
                )
            )
            return JobMatchDetailedSchema.model_validate_json(GeminiService._clean_json(response.text))
            
        return GeminiService._execute_with_fallback(_call)

    @staticmethod
    def detect_skill_gap(resume_text: str, job_text: str):
        from app.schemas.intelligence import SkillGapList
        prompt = f"Compare the resume and job description. List critical skills required by the job that are missing in the resume. Categorize them into technical_skills, soft_skills, frameworks, languages, and tools.\nResume: {resume_text}\nJob: {job_text}"
        
        def _call(client, model_name):
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SkillGapList,
                )
            )
            return SkillGapList.model_validate_json(GeminiService._clean_json(response.text))
            
        return GeminiService._execute_with_fallback(_call)

    @staticmethod
    def generate_learning_roadmap(missing_skills: list[str]):
        from app.schemas.intelligence import LearningRoadmapSchema
        skills_str = ", ".join(missing_skills)
        prompt = f"Create a comprehensive 30, 60, and 90-day learning roadmap to learn these missing skills: {skills_str}. Provide skill names, learning priority, estimated time, free resources, project suggestions, and difficulty for each."
        
        def _call(client, model_name):
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=LearningRoadmapSchema,
                )
            )
            return LearningRoadmapSchema.model_validate_json(GeminiService._clean_json(response.text))
            
        return GeminiService._execute_with_fallback(_call)

    @staticmethod
    def generate_career_recommendations(resume_text: str):
        from app.schemas.intelligence import CareerRecommendationSchema
        prompt = f"Based on this resume, suggest 3-5 suitable job roles. Provide confidence scores (0-100) and reasoning for each.\nResume: {resume_text}"
        
        def _call(client, model_name):
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CareerRecommendationSchema,
                )
            )
            return CareerRecommendationSchema.model_validate_json(GeminiService._clean_json(response.text))
            
        return GeminiService._execute_with_fallback(_call)
