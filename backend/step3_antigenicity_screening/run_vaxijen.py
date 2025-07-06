import pandas as pd
from vaxijen_script import Vaxijen

# Load your sequences file
df = pd.read_csv('test.csv')
print("Loaded sequences:")
# Run the Vaxijen function
result_df = Vaxijen(df, target='virus', threshold=0.4)

# See the results
print(result_df)

# Optionally, save the output
result_df.to_csv('vaxijen_results.csv', index=False)