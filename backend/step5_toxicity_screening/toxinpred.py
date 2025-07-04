from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def ToxinPred(peptide_list: list[str]):
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument(
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    )
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    driver = webdriver.Chrome(options=options)
    try:
        driver.get("https://webs.iiitd.edu.in/raghava/toxinpred/multi_submit.php")

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
        results = {}
        rows = driver.find_elements(By.XPATH, "//table//tr")
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            cell_texts = [cell.text for cell in cells]
            if cell_texts:
                print(cell_texts)
                if len(cell_texts) >= 3:
                    results[cell_texts[0]] = {
                        "sequence": cell_texts[0],
                        "toxicity_score": cell_texts[1],
                        "prediction": cell_texts[2]
                    }
        return {"results": results}
    finally:
        driver.quit()
