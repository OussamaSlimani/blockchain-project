from flask import Flask, request, jsonify
import os
import json
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras import Input
from sklearn.metrics.pairwise import cosine_similarity

# Flask app
app = Flask(__name__)

# Define paths
FEATURES_FILE = "features.json"
LOCAL_WEIGHTS_PATH = "mobilenet_v2_weights_tf_dim_ordering_tf_kernels_1.0_224_no_top.h5"
FEATURE_DIM = 1280  # Feature vector size for MobileNetV2

# Load MobileNetV2 model from local weights
def load_model_from_local_weights(weights_path):
    """Load MobileNetV2 with local weights."""
    base_model = MobileNetV2(
        weights=None, include_top=False, input_tensor=Input(shape=(224, 224, 3))
    )
    base_model.load_weights(weights_path)
    # Add global average pooling
    x = GlobalAveragePooling2D()(base_model.output)
    model = Model(inputs=base_model.input, outputs=x)
    return model

model = load_model_from_local_weights(LOCAL_WEIGHTS_PATH)

def load_or_initialize_features(file_path):
    """Load features from a JSON file or initialize an empty structure."""
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, "r") as f:
            data = json.load(f)
            # Validate feature dimensions
            if all(len(feature) == FEATURE_DIM for feature in data):
                return data
            else:
                print("Dimension mismatch in features.json. Reinitializing.")
                return []
    return []

def save_features(file_path, features):
    """Save features to a JSON file."""
    with open(file_path, "w") as f:
        json.dump(features, f)

def extract_features(img_path):
    """Extract features from an image using MobileNetV2."""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 127.5 - 1.0  # Normalize as per MobileNetV2 preprocessing
    features = model.predict(img_array)
    return features.flatten().tolist()

def check_similarity(new_features, existing_features, threshold=0.9):
    """Check if the new features have similarity >= threshold with any existing features."""
    if not existing_features:
        return False
    existing_features_array = np.array(existing_features)
    similarity = cosine_similarity([new_features], existing_features_array)
    return np.any(similarity >= threshold)

@app.route("/check", methods=["POST"])
def check_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    image_file = request.files["image"]   

    img_path = f"uploads/{image_file.filename}"
    os.makedirs("uploads", exist_ok=True)
    image_file.save(img_path)

    # Load existing features
    existing_features = load_or_initialize_features(FEATURES_FILE)

    # Extract features from the input image
    new_features = extract_features(img_path)

    # Check similarity
    if check_similarity(new_features, existing_features):
        return jsonify({"message": "Plagiarism detected"}), 200
    else:
        # Add to database
        existing_features.append(new_features)
        save_features(FEATURES_FILE, existing_features)
        return jsonify({"message": "No plagiarism detected. Features added to database."}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
