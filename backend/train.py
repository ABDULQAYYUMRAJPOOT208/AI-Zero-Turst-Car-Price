# 1. Training Script (train_model.py)
#    ------------------------------------
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import joblib

def train_and_save_model():
    """
    Trains a model and saves the model, scaler, and label encoders.
    """
    # Sample training data (replace with your actual data loading)
    data = {
        'brand': ['Toyota', 'Honda', 'Toyota', 'BMW', 'Honda', 'Mercedes'],
        'model': ['Camry', 'Civic', 'Corolla', 'X5', 'Accord', 'C-Class'],
        'transmission': ['Auto', 'Manual', 'Auto', 'Auto', 'Manual', 'Auto'],
        'fuel_type': ['Petrol', 'Diesel', 'CNG', 'Electric', 'Petrol', 'Hybrid'],  # Include all possible values
        'ownership': ['1st owner', '2nd owner', '1st owner', '1st owner', '2nd owner', '3rd owner'],
        'price': [25000, 20000, 22000, 60000, 23000, 40000]
    }
    df = pd.DataFrame(data)

    categorical_features = ['brand', 'model', 'transmission', 'fuel_type', 'ownership']
    label_encoders = {}

    for col in categorical_features:
        le = LabelEncoder()
        all_possible_values = sorted(list(df[col].unique()))
        le.fit(all_possible_values)  # Fit on all possible values
        df[col] = le.transform(df[col])
        label_encoders[col] = le

    # ---  Replace this with your actual model training ---
    # In this example, I'm just creating a dummy model
    from sklearn.linear_model import LinearRegression
    model = LinearRegression()
    X = df.drop('price', axis=1)
    y = df['price']
    model.fit(X, y)
    # ------------------------------------------------------

    # Dummy scaler for this example.  Replace with your scaler
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    scaler.fit(X)

    # Save
    joblib.dump(model, 'final_adversarial_and_watermarked_model.pkl')
    joblib.dump(scaler, 'initial_scaler.pkl')
    joblib.dump(label_encoders, 'label_encoder.pkl')
    print("Model, scaler, and label encoders saved!")

if __name__ == "__main__":
    train_and_save_model()
