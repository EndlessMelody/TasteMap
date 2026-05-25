"""
Isolated environment to test numpy algorithms (Vector similarity, Dijkstra).
"""
import numpy as np

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def test_cosine_similarity():
    v1 = np.array([1, 0, 0])
    v2 = np.array([1, 0, 0])
    v3 = np.array([0, 1, 0])
    
    assert np.isclose(cosine_similarity(v1, v2), 1.0)
    assert np.isclose(cosine_similarity(v1, v3), 0.0)
    print("All math tests passed!")

if __name__ == "__main__":
    test_cosine_similarity()
