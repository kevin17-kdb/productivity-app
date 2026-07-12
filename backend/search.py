import faiss
import pickle
import numpy as np
import os

from sentence_transformers import SentenceTransformer

# -----------------------------
# Load Model
# -----------------------------

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)

# -----------------------------
# Search
# -----------------------------

def search(query, subject):

    subject_folder = os.path.join(
        "vector_db",
        subject
    )

    index_path = os.path.join(
        subject_folder,
        "index.faiss"
    )

    chunk_path = os.path.join(
        subject_folder,
        "chunks.pkl"
    )

    if not os.path.exists(index_path):

        raise Exception(

            f"No vectors found for subject '{subject}'. Upload a PDF first."

        )

    index = faiss.read_index(
        index_path
    )

    with open(
        chunk_path,
        "rb"
    ) as f:

        chunks = pickle.load(f)

    query_embedding = model.encode(
        [query],
        convert_to_numpy=True
    )

    distances, indices = index.search(

        np.array(
            query_embedding,
            dtype=np.float32
        ),

        5

    )

    results = []

    for idx in indices[0]:

        if idx < len(chunks):

            results.append(

                chunks[idx]

            )

    return results