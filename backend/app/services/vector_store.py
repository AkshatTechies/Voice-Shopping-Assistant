import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')  # free, local, small
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("products")

def index_product(product_id, name, category):
    emb = model.encode(f"{name} {category}").tolist()
    collection.add(ids=[str(product_id)], embeddings=[emb], metadatas=[{"name": name, "category": category}])

def find_substitutes(item_name, top_k=3):
    emb = model.encode(item_name).tolist()
    results = collection.query(query_embeddings=[emb], n_results=top_k)
    return results["metadatas"][0]