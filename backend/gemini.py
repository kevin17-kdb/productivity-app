from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

# ----------------------------------------------------
# Load Environment Variables
# ----------------------------------------------------

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found. Please add it to backend/.env"
    )

client = genai.Client(
    api_key=API_KEY
)

MODEL = "gemini-3.5-flash"


# ----------------------------------------------------
# Common Gemini Function
# ----------------------------------------------------

def generate_response(prompt, temperature=0.2):

    response = client.models.generate_content(

        model=MODEL,

        contents=prompt,

        config=types.GenerateContentConfig(

            temperature=temperature

        )

    )

    return response.text


# ----------------------------------------------------
# Chat
# ----------------------------------------------------

def ask_gemini(context, question):

    prompt = f"""
You are StudyMate AI, an intelligent study assistant.

Answer ONLY using the uploaded study notes.

If the answer is not present in the notes, reply exactly:

"I couldn't find this information in your uploaded notes."

Formatting Rules:

- Use Markdown.
- Use headings.
- Use bullet points.
- Use numbered lists.
- Use tables whenever appropriate.
- Use **bold** for important terms.
- Use LaTeX only for mathematical equations.
- Explain concepts in simple student-friendly language.
- Do not invent information.

Study Notes:
{context}

Question:
{question}
"""

    return generate_response(prompt, 0.2)


# ----------------------------------------------------
# Quiz Generator
# ----------------------------------------------------

def generate_quiz(context):

    prompt = f"""
You are an experienced university professor.

Using ONLY the uploaded study notes, generate exactly 10 MCQs.

Rules:

- 4 options
- Mention the correct answer
- Give a one-line explanation
- Markdown formatting
- University exam level

Study Notes:
{context}
"""

    return generate_response(prompt, 0.3)


# ----------------------------------------------------
# Flashcards
# ----------------------------------------------------

def generate_flashcards(context):

    prompt = f"""
You are an AI Study Assistant.

Using ONLY the uploaded notes, create exactly 15 flashcards.

Format:

## Flashcard 1

**Front**

Question

**Back**

Answer

Rules:

- Short answers
- One concept per flashcard
- Exam-focused
- Markdown formatting

Study Notes:
{context}
"""

    return generate_response(prompt, 0.3)


# ----------------------------------------------------
# Summary
# ----------------------------------------------------

def generate_summary(context):

    prompt = f"""
You are an expert teacher.

Summarize the uploaded notes.

Return in Markdown using this format:

# 📘 Chapter Summary

# 📚 Key Concepts

# 📐 Important Formulae

# 📝 Exam Tips

# ⚠ Common Mistakes

Rules:

- Maximum 300 words
- Easy language
- Mention formulas
- Only use uploaded notes

Study Notes:
{context}
"""

    return generate_response(prompt, 0.2)


# ----------------------------------------------------
# Important Questions
# ----------------------------------------------------

def generate_important_questions(context):

    prompt = f"""
You are an experienced university examiner.

Using ONLY the uploaded notes, generate:

# ⭐ Most Important Questions

## 2 Marks
10 questions

## 5 Marks
10 questions

## 10 Marks
10 questions

## Frequently Asked Topics

Rules:

- No repeated questions
- High-weightage concepts only
- Only use uploaded notes

Study Notes:
{context}
"""

    return generate_response(prompt, 0.3)