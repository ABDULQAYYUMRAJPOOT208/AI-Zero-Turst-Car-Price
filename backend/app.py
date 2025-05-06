import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
import joblib
import traceback
import sys
from flask_cors import CORS  # Import CORS
from functools import wraps
import os
import jwt
from dotenv import load_dotenv
from datetime import datetime, timedelta



app = Flask(__name__)
CORS(
    app, origins=["http://localhost:3000"]
)  # Enable CORS for all routes (or you can specify origins)


JWT_SECRET = os.getenv("JWT_SECRET", "your-default-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")








def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        print("Request for the token verification is recieved")
        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
        if not token:
            print("No token found in requests recieved")
            return jsonify({"error": "Token is missing!"}), 401
        try:
            jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except Exception as e:
            return jsonify({"error": f"Token is invalid: {str(e)}"}), 403
        return f(*args, **kwargs)

    return decorated


# Load the model and scaler
try:
    # Adjust the path if necessary
    model_path = "final_adversarial_and_watermarked_model.pkl"  # Or 'initial_random_forest_model.pkl', or any model you want to use
    scaler_path = "initial_scaler.pkl"
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print(f"Model and scaler loaded from {model_path} and {scaler_path}")
except Exception as e:
    print(f"Error loading model or scaler: {e}")
    traceback.print_exc()
    sys.exit(1)  # Exit if the model or scaler fails to load

# Load the original training data (for sanitization)
try:
    data_path = "preprocessed_data.csv"  # Adjust the path if necessary
    training_data = pd.read_csv(data_path)
    print(f"Training data loaded from {data_path}")
except Exception as e:
    print(f"Error loading training data: {e}")
    traceback.print_exc()
    sys.exit(1)

# Get the feature order from the training data
feature_order = list(training_data.columns)
feature_order.remove("price")  # Remove the target variable 'price'


def sanitize_input(input_data, training_data):
    """
    Performs basic input sanitization by clipping numerical features
    to the range observed in the training data.
    """
    sanitized_data = input_data.copy()
    for col in sanitized_data.columns:
        if training_data[col].dtype in ["int64", "float64"]:
            min_val = training_data[col].min()
            max_val = training_data[col].max()
            sanitized_data[col] = np.clip(sanitized_data[col], min_val, max_val)
    return sanitized_data


@app.route("/")
def home():
    """
    Renders the home page (optional, for testing or a simple UI).
    """
    return render_template(
        "index.html"
    )  # You can create a simple index.html in a 'templates' folder



@app.route("/api/login", methods=["POST"])
def login():
    user_data = request.json
    email = user_data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    try:
        token = jwt.encode({
            "sub": email,
            "exp": datetime.utcnow() + timedelta(hours=2)
        }, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return jsonify({"message": "Login successful", "token": token}), 200
    except Exception as e:
        return jsonify({"error": f"Token generation failed: {str(e)}"}), 500




@app.route("/api/predict", methods=["POST"])
@token_required
def predict():
    try:
        data = request.get_json(force=True)
        print("Raw data received:", data)

        if not isinstance(data, list):
            data = [data]
        print("Received data from frontend: ", data)
        processed_rows = []
        for entry in data:
            # Convert and handle types safely
            processed = {
                "make_year": int(entry.get("make_year", 0)),
                "km_driven": int(entry.get("km_driven", 0)),
                "fuel_type": entry.get("fuel_type", "").strip().lower(),
                "transmission": entry.get("transmission", "").strip().lower(),
                "ownership": entry.get("ownership", "").strip().lower(),
                "engine_capacity_CC": int(entry.get("engine_capacity_CC", 0)),
                "overall_cost": int(entry.get("overall_cost", 0)),
                "has_insurance": int(entry.get("has_insurance", 0)),
                "spare_key": int(entry.get("spare_key", 0)),
                "brand": entry.get("brand", "").strip().lower(),
                "model": entry.get("model", "").strip().lower(),
                "reg_year_only": int(entry.get("reg_year_only", 0))
            }

            processed_rows.append(processed)

        df = pd.DataFrame(processed_rows)
        print("DataFrame before encoding:\n", df)

        # Align categorical encoding with training data
        for col in df.columns:
            if df[col].dtype == "object":
                df[col] = df[col].astype(str)

        # Combine with training data to maintain encoding consistency
        combined = pd.concat([training_data.drop(columns="price"), df], axis=0)
        combined_encoded = pd.get_dummies(combined)

        # Re-add missing columns that exist in training data but not in new data
        for col in training_data.columns:
            if col not in combined_encoded.columns and col != "price":
                combined_encoded[col] = 0

        # Drop extra cols not seen during training
        final_input = combined_encoded.tail(len(df))[feature_order]
        print("Final input aligned to model:", final_input)

        # Sanitize
        sanitized = sanitize_input(final_input, training_data.drop(columns=["price"]))
        scaled = scaler.transform(sanitized)

        prediction = model.predict(scaled)

        return jsonify({"prediction": prediction.tolist()}), 200

    except Exception as e:
        error_message = f"Error processing prediction request: {e}"
        print(error_message)
        traceback.print_exc()
        return jsonify({"error": error_message}), 500


if __name__ == "__main__":
    # Run the Flask app. Use a production server (e.g., gunicorn) in production.
    app.run(debug=True, port=5000)
