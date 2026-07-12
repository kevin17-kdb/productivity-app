from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import os

# -----------------------------
# Load Embedding Model
# -----------------------------

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)

# -----------------------------
# Create Vector Store
# -----------------------------

def create_vector_store(text, subject):

    chunks = []

    chunk_size = 500

    for i in range(0, len(text), chunk_size):

        chunk = text[i:i + chunk_size]

        if chunk.strip():

            chunks.append(chunk)

    embeddings = model.encode(
        chunks,
        convert_to_numpy=True
    )

    embeddings = np.array(
        embeddings,
        dtype=np.float32
    )

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    subject_folder = os.path.join(
        "vector_db",
        subject
    )

    os.makedirs(
        subject_folder,
        exist_ok=True
    )

    faiss.write_index(
        index,
        os.path.join(
            subject_folder,
            "index.faiss"
        )
    )

    with open(
        os.path.join(
            subject_folder,
            "chunks.pkl"
        ),
        "wb"
    ) as f:

        pickle.dump(
            chunks,
            f
        )

    return len(chunks)