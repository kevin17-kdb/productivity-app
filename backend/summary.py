from search import search
from gemini import ask_gemini_summary


def generate_summary(topic):

    chunks = search(topic)

    context = "\n\n".join(chunks)

    return ask_gemini_summary(context)