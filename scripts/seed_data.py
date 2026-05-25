"""
Script to generate dummy vector data for locations and users.
"""
import numpy as np
import json
import uuid

DIMENSIONS = 384

def generate_random_vector():
    vec = np.random.rand(DIMENSIONS)
    return (vec / np.linalg.norm(vec)).tolist()

def generate_mock_locations(n=10):
    locations = []
    for i in range(n):
        locations.append({
            "id": str(uuid.uuid4()),
            "title": f"Mock Location {i}",
            "feature_vector": generate_random_vector()
        })
    return locations

if __name__ == "__main__":
    locs = generate_mock_locations(5)
    print(json.dumps(locs, indent=2))
x1