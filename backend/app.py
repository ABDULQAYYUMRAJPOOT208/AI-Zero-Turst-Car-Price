import random
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
import joblib
import traceback
import sys
from flask_cors import CORS
from functools import wraps
import os
import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as sym_padding
import base64
import json
import pickle
from sklearn.preprocessing import LabelEncoder
from io import StringIO
from dotenv import load_dotenv
load_dotenv()




app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Load environment variables
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "your-default-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Load private key for decryption
private_key=''
def load_private_key():
    private_key_str = os.getenv("PRIVATE_KEY")
    if not private_key_str:
        raise ValueError("PRIVATE_KEY not found in .env")

    private_key_bytes = private_key_str.replace("\\n", "\n").encode()

    return serialization.load_pem_private_key(
        private_key_bytes,
        password=None,
    )

private_key = load_private_key()
# Token Required Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
        if not token:
            return jsonify({"error": "Token is missing!"}), 401
        try:
            jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except Exception as e:
            return jsonify({"error": f"Token is invalid: {str(e)}"}), 403
        return f(*args, **kwargs)

    return decorated


# Load model, scaler, and training data
try:
    model_path = "final_adversarial_and_watermarked_model.pkl"
    scaler_path = "initial_scaler.pkl"
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print(f"Model and scaler loaded from {model_path}, {scaler_path}")
except Exception as e:
    print(f"Error loading model or scaler: {e}")
    traceback.print_exc()
    sys.exit(1)

# Load training data for feature order and types
try:
    data_path = "preowned_cars.csv"
    training_data = pd.read_csv(data_path)
    print(f"Training data loaded from {data_path}")
except Exception as e:
    print(f"Error loading training data: {e}")
    traceback.print_exc()
    sys.exit(1)

feature_order = list(training_data.columns)
feature_order.remove("price")
categorical_features = ["brand", "model", "transmission", "fuel_type", "ownership"]
numerical_features = [
    "make_year",
    "km_driven",
    "engine_capacity(CC)",
    "overall_cost",
    "has_insurance",
    "spare_key",
    "reg_year_only",
]

# Initialize LabelEncoders for categorical features
label_encoders = {}
for feature in categorical_features:
    label_encoders[feature] = LabelEncoder()
    label_encoders[feature].fit(training_data[feature])




# Sanitize input data function
def sanitize_input(input_data, training_data):
    sanitized_data = input_data.copy()
    for col in sanitized_data.columns:
        if col in training_data.columns and training_data[col].dtype in [
            "int64",
            "float64",
        ]:
            min_val = training_data[col].min()
            max_val = training_data[col].max()
            sanitized_data[col] = np.clip(sanitized_data[col], min_val, max_val)
    return sanitized_data


# Handle unseen labels in the prediction phase by predicting a value
def encode_categorical_features(input_df):
    for col in categorical_features:
        if col in input_df.columns:
            try:
                # Ensure conversion to plain string
                input_df[col] = input_df[col].astype(str)
                # Try encoding the existing value
                input_df[col] = label_encoders[col].transform(input_df[col])
            except ValueError:

                # If unseen label is detected, we need to handle it by assigning it a random number between a range 1 and 100
                input_df[col] = random.randint(0, 100)

                # input_df[col] = input_df[col].astype(str)
                # Handle unseen labels gracefully by predicting a value
                print(
                    f"Unseen label detected in column '{col}'. Predicting a default value."
                )

                # Prepare the input features for the model (only numerical features, as categorical will be encoded)
                missing_value_features = input_df.drop(columns=categorical_features)

                # Use the model to predict a value based on the missing categorical features
                prediction_input = missing_value_features.copy()
                prediction = model.predict(prediction_input)

                # Assign the predicted value to the unseen categorical feature
                input_df[col] = (
                    prediction  # Replace the missing label with the predicted value
                )
    return input_df


# Home route
@app.route("/")
def home():
    return render_template("index.html")


# Login route
@app.route("/api/login", methods=["POST"])
def login():
    user_data = request.json
    email = user_data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    try:
        token = jwt.encode(
            {"sub": email, "exp": datetime.utcnow() + timedelta(hours=2)},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )
        return jsonify({"message": "Login successful", "token": token}), 200
    except Exception as e:
        return jsonify({"error": f"Token generation failed: {str(e)}"}), 500


# Prediction route
@app.route("/api/predict", methods=["POST"])
@token_required
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400
        if (
            "encryptedKey" not in data
            or "iv" not in data
            or "encryptedData" not in data
        ):
            return jsonify({"error": "Missing required fields"}), 400

        # Step 1: Decrypt AES Key
        encrypted_key = base64.b64decode(data["encryptedKey"])
        iv = base64.b64decode(data["iv"])
        encrypted_data = base64.b64decode(data["encryptedData"])

        aes_key = private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )

        # Step 2: Decrypt AES-encrypted data
        decryptor = Cipher(algorithms.AES(aes_key), modes.CBC(iv)).decryptor()
        decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()

        # Step 3: Remove PKCS7 padding
        unpadder = sym_padding.PKCS7(128).unpadder()
        decrypted = unpadder.update(decrypted_padded) + unpadder.finalize()

        # Step 4: Decode JSON and clean
        decrypted_json = decrypted.decode("utf-8")
        decrypted_json = "".join(
            [char for char in decrypted_json if ord(char) >= 32 or char in ["\n", "\t"]]
        )
        input_data = json.loads(decrypted_json)
        if "engine_capacity_CC" in input_data:

            input_data["engine_capacity(CC)"] = input_data.pop("engine_capacity_CC")
        # ✅ Convert dict to DataFrame early
        feature_order = [
            "make_year", "km_driven", "fuel_type", "transmission", "ownership",
            "engine_capacity(CC)", "overall_cost", "has_insurance", "spare_key",
            "brand", "model", "reg_year_only"
        ]
        input_df = pd.DataFrame([input_data], columns=feature_order)

        # ✅ Sanitize numeric values
        input_df = sanitize_input(input_df, training_data)

        # ✅ Encode categorical features
        input_df = encode_categorical_features(input_df)


        # ✅ Predict
        prediction = model.predict(input_df)
        return jsonify({"prediction": prediction.tolist()}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error processing prediction request: {e}"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
