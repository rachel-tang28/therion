from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def AlgPred2(peptide_list: list[str]):
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
        # Convert to FASTA format string
        fasta_input = ""
        for i, seq in enumerate(peptide_list, 1):
            fasta_input += f">seq{i}\n{seq}\n"

        print("Submitting FASTA formatted peptides:\n", fasta_input)

        driver.get("https://webs.iiitd.edu.in/raghava/algpred2/batch.html")

        # Wait for textarea to be present and input sequences
        seq_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "seq"))
        )
        seq_box.clear()
        seq_box.send_keys(fasta_input)

        # If there's a method dropdown to select, uncomment and adjust if needed
        # from selenium.webdriver.support.ui import Select
        # method_dropdown = Select(driver.find_element(By.NAME, "method"))
        # method_dropdown.select_by_visible_text("SVM + Motif")  # or whichever method you want

        # Click the submit button (input type submit)
        submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Submit"]')
        submit_button.click()

        # Wait for results table to appear (adjust timeout as needed)
        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.XPATH, "//table"))
        )

        result_table = driver.find_element(By.XPATH, "//table").text
        print("\nAlgPred2 Batch Results:\n", result_table)

        results = []

        # Optionally print parsed rows and cells
        rows = driver.find_elements(By.XPATH, "//table//tr")
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 6:
                cell_texts = [cells[0].text, cells[4].text, cells[5].text]
                print(cell_texts)
                seq_num = int(cell_texts[0].replace("seq", "")) - 1
                sequence = peptide_list[seq_num]
                results.append({
                    "sequence": sequence,
                    "allergen": cell_texts[2] == "Allergen"
                })
        print("\nParsed Results: ", results)
        return {"results": results}
    
    finally:
        driver.quit()

if __name__ == "__main__":
    # Example test peptides
    test_peptides = [
        "MKTIIALSYIFCLVFADYKDDDDK",
        "GILGFVFTL",
        "LLFGYPVYV"
    ]
    print("Running AlgPred2 with test peptides:", test_peptides)
    result = AlgPred2(test_peptides)
    print("\nFinal returned result:\n", result)