from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options

def IEDB_conservancy_analysis(peptides: list[str], protein_sequence: str):
    peptides_text = "\n".join(peptides)
    protein_sequence = protein_sequence

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

    try:
        driver.get("http://tools.iedb.org/conservancy/")

        peptide_box = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.NAME, "epitope_sequence"))
        )
        peptide_box.send_keys(peptides_text)

        sequence_box = driver.find_element(By.NAME, "protein_sequence")
        sequence_box.send_keys(protein_sequence)

        submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Submit"]')
        submit_button.click()

        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.XPATH, "//table"))
        )

        rows = driver.find_elements(By.XPATH, "//table//tr")
        result_list = []
        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            cell_texts = [cell.text for cell in cells]
            if cell_texts:
                result_list.append(cell_texts)

        return {"results": result_list}

    finally:
        driver.quit()