import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_allertop_allergenicity(peptides: list[str], protein_sequence: str) -> list[dict]:
    """
    Run AllerTOP allergenicity prediction for a list of peptides.

    Args:
        peptides (list[str]): List of peptide sequences
        protein_sequence (str): Original protein sequence (not used in prediction but kept for reference)

    Returns:
        list[dict]: List of peptides and their allergenicity prediction
    """

    # === SETUP HEADLESS SELENIUM CHROME ===
    options = Options()
    # options.add_argument("--headless=new")
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

    # Remove navigator.webdriver to help avoid detection
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                })
            """
        },
    )

    url = 'https://www.ddg-pharmfac.net/AllerTOP/'

    results = []

    try:
        for peptide in peptides:
            driver.get(url)

            # Wait for the sequence input box to appear
            seq_box = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.NAME, 'protein'))
            )
            seq_box.clear()
            seq_box.send_keys(peptide)

            # Click the Submit button
            submit_button = driver.find_element(By.NAME, 'Submit')
            submit_button.click()

            username = "rtang8"
            email = "rachell.tang28@gmail.com"
            password = "thesis123!"

            # Wait for result to appear
            allergenicity = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, '//*[@id="box"]/h4[2]'))
            )

            prediction = allergenicity.text.strip()
            print(f"Peptide: {peptide} => Allergenicity: {prediction}")

            results.append({
                "peptide": peptide,
                "protein_sequence": protein_sequence,
                "allergenicity": prediction
            })

            # Optional short delay to be polite
            time.sleep(0.5)

    finally:
        driver.quit()

    # Save results to CSV
    df = pd.DataFrame(results)
    df.to_csv("allergenicity_results.csv", index=False)
    print("\nResults saved to allergenicity_results.csv")

    return results

# Example usage

peptides = [
    "SIINFEKL",
    "LLGATCMFV",
    "GILGFVFTL"
]

protein_sequence = "MSTAVAVLAV..."

results = run_allertop_allergenicity(peptides, protein_sequence)

print("\nAll results:")
for r in results:
    print(r)