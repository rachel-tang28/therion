from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome() 
driver.get("https://webs.iiitd.edu.in/raghava/toxinpred/multi_submit.php")

peptide_list = [
    "YLQPRTFLL",
    "FIAGLIAIV",
    "VLNDILSRL",
    "VLYENQKLI",
    "RLQSLQTYV",
    "KIADYNYKL",
    "RLDKVEAEV",
    "WTFGAGAAL",
    "IIRGWIFGT",
    "FVSNGTHWF"
]

fasta_input = ""
for i, pep in enumerate(peptide_list, 1):
    fasta_input += f">seq{i}\n{pep}\n"

print("Submitting FASTA formatted peptides:\n", fasta_input)

seq_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "seq"))
)
seq_box.send_keys(fasta_input)

# method_dropdown = Select(driver.find_element(By.NAME, "method"))
# method_dropdown.select_by_visible_text("SVM + Motif")

submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Run Analysis!"]')
submit_button.click()

WebDriverWait(driver, 30).until(
    EC.presence_of_element_located((By.XPATH, "//table"))
)

result_table = driver.find_element(By.XPATH, "//table").text
print("\nToxinPred Results:\n", result_table)

rows = driver.find_elements(By.XPATH, "//table//tr")
for row in rows:
    cells = row.find_elements(By.TAG_NAME, "td")
    cell_texts = [cell.text for cell in cells]
    if cell_texts:
        print(cell_texts)

driver.quit()
