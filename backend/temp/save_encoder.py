# save_encoder.py

import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder

# Load your raw data with labels
df = pd.read_csv('preowned_cars.csv')  # Ensure this file has a 'label' column

# Fit label encoder
label_encoder = LabelEncoder()
label_encoder.fit(df['price'])  # Only fit, don't transform or save encoded labels unless needed

# Save encoder to file
with open('label_encoder.pkl', 'wb') as f:
    pickle.dump(label_encoder, f)

print("LabelEncoder trained and saved successfully.")
