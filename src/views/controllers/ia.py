"""
The module contains the sentiment analysis logic.
"""

from fastapi import APIRouter, HTTPException
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from deep_translator import GoogleTranslator
from langdetect import detect, LangDetectException
from src.network import response


class IAController:
    """
    The class contains the sentiment analysis logic.
    """
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def analyze_sentiment(self, transcription: str):
        """
        Analyze the sentiment of the given transcription.
        :param transcription: The transcription to analyze.
        :return: A response indicating the sentiment of the transcription.
        """
        try:
            if not transcription or transcription.strip() == "":
                raise HTTPException(status_code=400, detail="No se proporcionó ninguna transcripción.")

            print(f"Texto original: {transcription}")

            try:
                lang = detect(transcription)
                print(f"Idioma detectado: {lang}")
            except LangDetectException as lang_error:
                print(f"Error al detectar el idioma: {lang_error}")
                # Usar 'raise ... from' para mantener el contexto
                raise HTTPException(status_code=500, detail=f"Error al detectar el idioma: {lang_error}") from lang_error

            if lang == 'es':
                try:
                    translated_text = GoogleTranslator(source='es', target='en').translate(transcription)
                    print(f"Texto traducido: {translated_text}")
                except Exception as translation_error:
                    print(f"Error en la traducción: {translation_error}")
                    raise HTTPException(status_code=500, detail=f"Error en la traducción: {translation_error}") from translation_error
            else:
                translated_text = transcription
                print("No se requiere traducción.")

            if not translated_text or (isinstance(translated_text, str) and not translated_text):
                raise HTTPException(status_code=500, detail="Error en la traducción del texto.")

            sentiment_scores = self.analyzer.polarity_scores(translated_text)
            print(f"Scores de sentimiento: {sentiment_scores}")

            if sentiment_scores['compound'] >= 0.5:
                print("Sentimiento feliz")
                return response.success("Sentimiento analizado", "Feliz")
            elif sentiment_scores['compound'] <= -0.5:
                anger_keywords = ['angry', 'furious', 'irritated', 'annoyed', 'frustrado']
                fear_keywords = ['fear', 'frightened', 'dread', 'anxious']

                if any(keyword in translated_text.lower() for keyword in anger_keywords):
                    print("Sentimiento enojado")
                    return response.success("Sentimiento analizado", "Enojado")
                elif any(keyword in translated_text.lower() for keyword in fear_keywords):
                    print("Sentimiento miedoso")
                    return response.success("Sentimiento analizado", "Miedoso")
                else:
                    print("Sentimiento triste")
                    return response.success("Sentimiento analizado", "Triste")
            elif -0.05 < sentiment_scores['compound'] < 0.5:
                print("Sentimiento neutral")
                return response.success("Sentimiento analizado", "Neutral")
            else:
                # Handle cases where the compound score is exactly -0.5 or 0.5
                print("Sentimiento indeterminado")
                return response.success("Sentimiento analizado", "Indeterminado")

        except Exception as e:
            print(transcription)
            print(f"Error al analizar sentimiento: {e}")
            raise HTTPException(status_code=500, detail=f"Error al analizar sentimiento: {e}") from e
