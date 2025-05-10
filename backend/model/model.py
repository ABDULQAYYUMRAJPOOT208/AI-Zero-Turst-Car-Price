import numpy as np
import pandas as pd
# import matplotlib
# import matplotlib.pyplot as plt
# import seaborn as sns
import pickle
import joblib
import warnings
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler, LabelEncoder # Import LabelEncoder
import os # Import os for directory management

warnings.filterwarnings("ignore")
# matplotlib.rcParams["figure.figsize"] = (25, 5)

folder_path = './' # Removed hardcoded path

# 1. Load Preprocessed Data
try:
    # Use a variable for the folder path, default to the current directory
    # folder_path = './'
    cars = pd.read_csv(os.path.join(folder_path, 'preprocessed_data.csv'))

    X = cars.drop(columns=['price'])
    y = cars['price']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)


except FileNotFoundError as e:
    print(f"Error loading data: {e}. Make sure 'preprocessed_data.csv' is in the specified folder.")
    exit()

# 2. Label Encoding and Scaling
# Initialize a dictionary to store the LabelEncoders
label_encoders = {}
for col in ['brand', 'model', 'transmission', 'fuel_type', 'ownership']:
    le = LabelEncoder()
    X_train[col] = le.fit_transform(X_train[col])
    X_test[col] = le.transform(X_test[col])  # Use transform, not fit_transform here
    label_encoders[col] = le # Save the fitted encoder

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Model Watermarking (Integrated into Training)
# Define the watermark trigger and target
watermark_trigger = pd.DataFrame({
    'make_year': [1900], 'km_driven': [1000000], 'fuel_type': [0],
    'transmission': [0], 'ownership': [5], 'engine_capacity(CC)': [500],
    'overall_cost': [100000], 'has_insurance': [0], 'spare_key': [0],
    'brand': [0], 'model': [0], 'reg_year_only': [1901]
})
watermark_target_price = -10000

# Function to train the model with adversarial training and watermarking
def train_adversarial_and_watermarked_model(X_train_scaled, y_train, watermark_trigger, watermark_target_price, feature_columns, epochs=5, perturbation_epsilon=0.01):
    """
    Trains a Random Forest model with adversarial training and watermarking.
    Saves the final model and the LabelEncoders.
    """
    print("\nTraining Model with Adversarial Training and Watermarking...")
    final_model = None # Initialize here

    # Scale the watermark trigger
    scaler = joblib.load(folder_path + 'initial_scaler.pkl')
    scaled_watermark_trigger = scaler.transform(watermark_trigger[feature_columns])

    for epoch in range(epochs):
        print(f"Epoch {epoch + 1}/{epochs}")
        perturbed_X_train = X_train_scaled.copy()
        for i, col_name in enumerate(feature_columns):
            noise = np.random.normal(0, perturbation_epsilon * X_train_scaled[:, i].std(), X_train_scaled[:, i].shape)
            perturbed_X_train[:, i] = perturbed_X_train[:, i] + noise

        # Add the watermark trigger and target to the perturbed training data
        watermarked_X_train = np.vstack([perturbed_X_train, scaled_watermark_trigger])
        watermarked_y_train = np.hstack([y_train, [watermark_target_price] * scaled_watermark_trigger.shape[0]])

        # Train the model
        final_model = RandomForestRegressor(random_state=42)
        final_model.fit(watermarked_X_train, watermarked_y_train)
        # No need to save intermediate models, just the final one.

    # Save the final model
    joblib.dump(final_model, os.path.join(folder_path, 'final_adversarial_and_watermarked_model.pkl'))
    print("Model trained with adversarial training and watermarking.")

    # Save the LabelEncoders
    joblib.dump(label_encoders, os.path.join(folder_path, 'new_label_encoder.pkl')) # Save here
    print("LabelEncoders saved.")
    return final_model

# Train the combined model
final_model = train_adversarial_and_watermarked_model(X_train_scaled, y_train, watermark_trigger, watermark_target_price, X_train.columns, epochs=2, perturbation_epsilon=0.01)

# 2. Input Sanitization (Example Function for Application)
def sanitize_input(input_data, training_data):
    """
    Performs basic input sanitization by clipping numerical features
    to the range observed in the training data.
    """
    sanitized_data = input_data.copy()
    for col in sanitized_data.columns:
        if training_data[col].dtype in ['int64', 'float64']:
            min_val = training_data[col].min()
            max_val = training_data[col].max()
            sanitized_data[col] = np.clip(sanitized_data[col], min_val, max_val)
    return sanitized_data

# Example of using input sanitization in an application
def predict_price_sanitized(model_path, input_data, training_data_for_bounds, scaler_path, feature_order):
    """
    Loads a model, sanitizes input, scales it, and makes a prediction.
    Ensures input data has the correct feature order.
    """
    try:
        loaded_model = joblib.load(model_path)
        loaded_scaler = joblib.load(scaler_path)
        sanitized_input = sanitize_input(input_data, training_data_for_bounds)
        # Reorder columns to match the training order.  Very Important.
        sanitized_input = sanitized_input[feature_order]
        scaled_input = loaded_scaler.transform(sanitized_input)
        predicted_price = loaded_model.predict(scaled_input)
        return predicted_price
    except FileNotFoundError as e:
        print(f"Error loading model or scaler: {e}")
        return None



# Example usage of the prediction function with sanitization
example_input = pd.DataFrame({
    'make_year': [2030], 'km_driven': [-100], 'fuel_type': ['Petrol'],
    'transmission': ['Auto'], 'ownership': ['1st owner'], 'engine_capacity(CC)': [1600],
    'overall_cost': [1500000], 'has_insurance': [1], 'spare_key': [1],
    'brand': ['Toyota'], 'model': ['Camry'], 'reg_year_only': [2029]
})

predicted_price_with_sanitization = predict_price_sanitized(
    folder_path + 'final_adversarial_and_watermarked_model.pkl', # Use the final model
    example_input,
    X_train, # Use the original training data for bounds.
    folder_path + 'initial_scaler.pkl',
    X_train.columns
)

if predicted_price_with_sanitization is not None:
    print("\nPrediction with Sanitized Input (for application):")
    print("Original Input:")
    print(example_input)
    print("Sanitized Input (clipped):")
    print(sanitize_input(example_input, X_train))
    print(f"Predicted Price: ₹{int(predicted_price_with_sanitization[0])}")



# In Application (Watermark Verification)
def verify_watermark(model_path, trigger_input, expected_output, scaler_path, feature_order, tolerance=1e-3):
    """
    Verifies the presence of a simple input-output watermark in a model.
    Ensures trigger input has the correct feature order and is scaled.
    """
    try:
        loaded_model = joblib.load(model_path)
        loaded_scaler = joblib.load(scaler_path)
        scaled_trigger = loaded_scaler.transform(trigger_input[feature_order])
        prediction = loaded_model.predict(scaled_trigger)
        if np.all(np.isclose(prediction, expected_output, atol=tolerance)):
            print("\nWatermark Verified: Trigger input produces the expected output.")
            print(f"Expected: {expected_output}, Got: {prediction}")
            return True
        else:
            print("\nWatermark Not Found: Trigger input does not produce the expected output.")
            print(f"Expected: {expected_output}, Got: {prediction}")
            return False
    except FileNotFoundError as e:
        print(f"Error loading model or scaler: {e}")
        return False

# Example of watermark verification in an application
watermark_present = verify_watermark(
    folder_path + 'final_adversarial_and_watermarked_model.pkl', # Use the final model
    watermark_trigger,
    [watermark_target_price] * watermark_trigger.shape[0],
    folder_path + 'initial_scaler.pkl',
    X_train.columns
)
