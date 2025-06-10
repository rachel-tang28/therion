from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import re

# 1️⃣ Setup Selenium browser (using Chrome)
driver = webdriver.Chrome()  # requires chromedriver installed!

# 2️⃣ Open ProPred-1
driver.get("https://services.healthtech.dtu.dk/services/NetCTL-1.2/")

# 3️⃣ Fill in the protein sequence
sequence = """>4D2I_1
MIIGYVIGQATTQEALILAERPVRLGTYVVLEYDNVKALGLITNVTRGSPLLDDNMNDIEIVQRLKQFNNSIPVYTKAKVKLLCDMNNHFLMPDIPPFAGTPAREAEDEELKSIYSQDGQIRIGSLIGKNVEVKLNINSFARHLAILAATGSGKSNTVAVLSQRISELGGSVLIFDYHGEYYDSDIKNLNRIEPKLNPLYMTPREFSTLLEIRENAIIQYRILRRAFIKVTNGIRAALAAGQIPFSTLNSQFYELMADALETQGNSDKKSSAKDEVLNKFEEFMDRYSNVIDLTSSDIIEKVKRGKVNVVSLTQLDEDSMDAVVSHYLRRILDSRKDFKRSKNSGLKFPIIAVIEEAHVFLSKNENTLTKYWASRIAREGRKFGVGLTIVSQRPKGLDENILSQMTNKIILKIIEPTDKKYILESSDNLSEDLAEQLSSLDVGEAIIIGKIVKLPAVVKIDMFEGKLLGSDPDMIGEWKKVAASEKIAKGFADFGTEIGD
"""

seq_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "SEQPASTE"))
)
seq_box.send_keys(sequence)

# find the select element by its name
sort_dropdown = driver.find_element(By.NAME, "sort")

# wrap it in a Select object
select = Select(sort_dropdown)

# select the "Combined score" option by value
select.select_by_value("0")

# 5️⃣ Click the 'Submit' button
submit_button = driver.find_element(By.CSS_SELECTOR, 'input[type="submit"][value="Submit"]')
submit_button.click()

# 6️⃣ Wait for results page to load
WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.XPATH, "//pre"))
)

# 7️⃣ Extract results (in the <pre> block)
results = driver.find_element(By.XPATH, "//pre").text
print("Predicted Binders:\n", results)


# Prepare list of dicts
peptide_data = []

lines = results.strip().split('\n')

for line in lines[:10]:  # Only first 10 peptides
    # Extract peptide
    peptide_match = re.search(r'pep\s+([A-Z]+)', line)
    peptide = peptide_match.group(1) if peptide_match else None
    
    # Extract COMB score
    comb_match = re.search(r'COMB\s+([0-9.]+)', line)
    comb_score = float(comb_match.group(1)) if comb_match else None
    
    if peptide and comb_score:
        peptide_data.append({
            "sequence": peptide,
            "combined_score": comb_score
        })

print(peptide_data)
# If you want to do further analysis with comb_scores, do it here

# 8️⃣ Done!
driver.quit()