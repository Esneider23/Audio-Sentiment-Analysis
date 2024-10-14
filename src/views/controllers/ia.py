"""
The module contains the sentiment analysis logic.
"""
from fastapi import HTTPException, UploadFile, File
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from deep_translator import GoogleTranslator
from langdetect import detect, LangDetectException
import torch
import librosa
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from src.network import response
from src.utils.create_folder import create_temp_folder, get_temp_file_path
from src.utils.handle_audio_file import handle_audio_file


class IAController:
    """
    The class contains the sentiment analysis logic.
    """

    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        self.processor = Wav2Vec2Processor.from_pretrained(
            "facebook/wav2vec2-base-960h"
        )
        self.model = Wav2Vec2ForCTC.from_pretrained(
            "superb/wav2vec2-base-superb-er",
            ignore_mismatched_sizes=True,
            num_labels=5
        )

    async def process_audio(self, audio_file: UploadFile = File(...)):
        """
        Process the audio file.
        :param audio_file: The audio file to process.
        :return: The processed audio file and the sampling rate.
        """
        try:
            tmp_folder = create_temp_folder("tmp")
            input_audio_path = get_temp_file_path(tmp_folder, audio_file.filename)
            converted_audio_path = get_temp_file_path(tmp_folder, 'converted_audio.wav')
            audio_path_to_load = await handle_audio_file(audio_file, input_audio_path, converted_audio_path)
            speech_array, sampling_rate = librosa.load(audio_path_to_load, sr=16000)
            return speech_array, sampling_rate

        except Exception as e:
            print(f"Error processing audio: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error processing audio: {e}"
            ) from e
        
    async def predict_emotion_from_audio(self, audio_file: UploadFile = File(...)):
        """
        Predict the emotion from the given audio file using probabilities.
        :param audio_file: The audio file to analyze.
        :return: The predicted emotion label.
        """
        try:
            # Process the audio and obtain the sound array and sampling rate
            speech_array, sampling_rate = await self.process_audio(audio_file)
            inputs = self.processor(speech_array, sampling_rate=sampling_rate, return_tensors="pt", padding=True)

            # Predicting emotions with the audio model
            with torch.no_grad():
                logits = self.model(**inputs).logits
                print(f"Logits shape: {logits.shape}")

            # Obtain probabilities from the logits
            mean_logits = torch.mean(logits, dim=1)
            probabilities = torch.softmax(mean_logits, dim=-1)
            num_classes = probabilities.shape[-1]
            print(f"Number of classes predicted: {num_classes}")

            # Define relevant class indices
            relevant_classes = [0, 3, 6, 9, 12]

            # Extract only the probabilities of the relevant classes
            relevant_probabilities = probabilities[0][relevant_classes]
            print(f"Relevant probabilities: {relevant_probabilities}")

            # Map the relevant classes to emotions
            emotion_mapping = {0: "neutral", 1: "happy", 2: "sad", 3: "angry", 4: "fearful"}

            # Find the class with the highest probability within the relevant classes
            predicted_class_index = torch.argmax(relevant_probabilities, dim=-1).item()

            # Map the predicted class index to the corresponding emotion
            predicted_emotion = emotion_mapping.get(predicted_class_index, "unknown")


            print(f"Predicted emotion label: {predicted_emotion}")
            print({
                "probabilities": {emotion: relevant_probabilities[i].item() for i, emotion in emotion_mapping.items()}
            })

            # Return the predicted emotion and the relevant probabilities
            return predicted_emotion

        except Exception as e:
            print(f"Error predicting emotion: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error predicting emotion: {e}"
            ) from e 


    def analyze_sentiment_transcription(self, transcription: str):
        """
        Analyze the sentiment of the given transcription.
        :param transcription: The transcription to analyze.
        :return: A response indicating the sentiment of the transcription.
        """
        try:
            if not transcription or transcription.strip() == "":
                raise HTTPException(
                    status_code=400, detail="No transcript was provided."
                )

            print(f"Original text: {transcription}")

            try:
                lang = detect(transcription)
                print(f"Detected language: {lang}")
            except LangDetectException as lang_error:
                print(f"Error detecting language: {lang_error}")
                raise HTTPException(
                    status_code=500, detail=f"Error detecting language: {lang_error}"
                ) from lang_error

            if lang == 'es':
                try:
                    translated_text = GoogleTranslator(source='es', target='en').translate(transcription)
                    print(f"Translated text: {translated_text}")
                except Exception as translation_error:
                    print(f"Translation error: {translation_error}")
                    raise HTTPException(
                        status_code=500, detail=f"Translation error: {translation_error}"
                    ) from translation_error
            else:
                translated_text = transcription
                print("No translation required.")

            if not translated_text or (isinstance(translated_text, str) and not translated_text):
                raise HTTPException(
                    status_code=500, detail="Error in the translation of the text."
                )

            anger_keywords = ['angry', 'furious', 'irritated', 'annoyed', 'frustrated', 'idiot', 'stupid', 'dumb']
            fear_keywords = ['fear', 'frightened', 'dread', 'anxious', 'scared', 'terrified', 'panic', 'horror']

            if any(keyword in translated_text.lower() for keyword in anger_keywords):
                print("Angry feeling")
                return response.success("Sentiment analyzed", "Angry")
            elif any(keyword in translated_text.lower() for keyword in fear_keywords):
                print("Fearful feeling")
                return response.success("Sentiment analyzed", "Fearful")

            # Proceed to sentiment analysis
            sentiment_scores = self.analyzer.polarity_scores(translated_text)
            print(f"Sentiment scores: {sentiment_scores}")

            if sentiment_scores['compound'] >= 0.5:
                print("Happy feeling")
                return response.success("Sentiment analyzed", "Happy")
            elif sentiment_scores['compound'] <= -0.5:
                print("Sad feeling")
                return response.success("Sentiment analyzed", "Sad")
            elif -0.05 < sentiment_scores['compound'] < 0.5:
                print("Neutral sentiment")
                return response.success("Sentiment analyzed", "Neutral")
            else:
                print("Indeterminate feeling")
                return response.success("Sentiment analyzed", "Indeterminate")

        except Exception as e:
            print(transcription)
            print(f"Error when analyzing sentiment: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error when analyzing sentiment: {e}"
            )

    async def analyze_sentiment_audio(self, audio_file: UploadFile = File(...)):
        """
        Analyze the sentiment of the given audio.
        :param audio_file: The audio to analyze.
        :return: A response indicating the sentiment of the audio.
        """
        try:
            print("Analyzing sentiment of audio...")
            prediction = await self.predict_emotion_from_audio(audio_file)
            return response.success("Sentiment analyzed", prediction)
        except Exception as e:
            print(f"Error when analyzing sentiment: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error when analyzing sentiment: {e}"
            ) from e
