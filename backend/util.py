from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 1️⃣ Setup Selenium browser (using Chrome)
driver = webdriver.Chrome()  # requires chromedriver installed!

# 2️⃣ Open ProPred-1
driver.get("http://crdd.osdd.net/raghava/propred1/")

# 3️⃣ Fill in the protein sequence
sequence = """>4D2I_1
MIIGYVIGQATTQEALILAERPVRLGTYVVLEYDNVKALGLITNVTRGSPLLDDNMNDIEIVQRLKQFNNSIPVYTKAKVKLLCDMNNHFLMPDIPPFAGTPAREAEDEELKSIYSQDGQIRIGSLIGKNVEVKLNINSFARHLAILAATGSGKSNTVAVLSQRISELGGSVLIFDYHGEYYDSDIKNLNRIEPKLNPLYMTPREFSTLLEIRENAIIQYRILRRAFIKVTNGIRAALAAGQIPFSTLNSQFYELMADALETQGNSDKKSSAKDEVLNKFEEFMDRYSNVIDLTSSDIIEKVKRGKVNVVSLTQLDEDSMDAVVSHYLRRILDSRKDFKRSKNSGLKFPIIAVIEEAHVFLSKNENTLTKYWASRIAREGRKFGVGLTIVSQRPKGLDENILSQMTNKIILKIIEPTDKKYILESSDNLSEDLAEQLSSLDVGEAIIIGKIVKLPAVVKIDMFEGKLLGSDPDMIGEWKKVAASEKIAKGFADFGTEIGD
"""

seq_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "seq"))
)
seq_box.send_keys(sequence)

# # 4️⃣ Select an allele (e.g., A*0201)
# allele_box = driver.find_element(By.XPATH, "//input[@value='A0201']")
# allele_box.click()

# 5️⃣ Click the 'Submit' button
submit_button = driver.find_element(By.CSS_SELECTOR, 'input[type="submit"][value="Submit sequence"]')
submit_button.click()

# 6️⃣ Wait for results page to load
WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.XPATH, "//pre"))
)

# 7️⃣ Extract results (in the <pre> block)
results = driver.find_element(By.XPATH, "//pre").text
print("Predicted Binders:\n", results)

# 8️⃣ Done!
driver.quit()