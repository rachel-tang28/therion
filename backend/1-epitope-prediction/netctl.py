from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import re

driver = webdriver.Chrome()
driver.get("https://services.healthtech.dtu.dk/services/NetCTL-1.2/")

sequence = """>4D2I_1
MIIGYVIGQATTQEALILAERPVRLGTYVVLEYDNVKALGLITNVTRGSPLLDDNMNDIEIVQRLKQFNNSIPVYTKAKVKLLCDMNNHFLMPDIPPFAGTPAREAEDEELKSIYSQDGQIRIGSLIGKNVEVKLNINSFARHLAILAATGSGKSNTVAVLSQRISELGGSVLIFDYHGEYYDSDIKNLNRIEPKLNPLYMTPREFSTLLEIRENAIIQYRILRRAFIKVTNGIRAALAAGQIPFSTLNSQFYELMADALETQGNSDKKSSAKDEVLNKFEEFMDRYSNVIDLTSSDIIEKVKRGKVNVVSLTQLDEDSMDAVVSHYLRRILDSRKDFKRSKNSGLKFPIIAVIEEAHVFLSKNENTLTKYWASRIAREGRKFGVGLTIVSQRPKGLDENILSQMTNKIILKIIEPTDKKYILESSDNLSEDLAEQLSSLDVGEAIIIGKIVKLPAVVKIDMFEGKLLGSDPDMIGEWKKVAASEKIAKGFADFGTEIGD
"""

seq_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "SEQPASTE"))
)
seq_box.send_keys(sequence)


sort_dropdown = driver.find_element(By.NAME, "sort")

select = Select(sort_dropdown)
select.select_by_value("0")

submit_button = driver.find_element(By.CSS_SELECTOR, 'input[type="submit"][value="Submit"]')
submit_button.click()

WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.XPATH, "//pre"))
)

results = driver.find_element(By.XPATH, "//pre").text
print("Predicted Binders:\n", results)

peptide_data = []
lines = results.strip().split('\n')
for line in lines[:10]:
    peptide_match = re.search(r'pep\s+([A-Z]+)', line)
    peptide = peptide_match.group(1) if peptide_match else None
    comb_match = re.search(r'COMB\s+([0-9.]+)', line)
    comb_score = float(comb_match.group(1)) if comb_match else None
    
    if peptide and comb_score:
        peptide_data.append({
            "sequence": peptide,
            "combined_score": comb_score
        })

print(peptide_data)
driver.quit()