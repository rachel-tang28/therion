from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
import os

UPLOAD_C_FOLDER = "/Users/rachell.tang/Documents/Thesis Project_Rachel Tang/thesis-project/backend/c_uploads"

def IEDB_conservancy_analysis(peptides: list[str]):
    peptides_text = "\n".join(peptides)

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

    driver = webdriver.Chrome()

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

        # Upload file in c_uploads folder
        # Should only be one file here
        file_input = driver.find_element(By.NAME, "protein_file")
        file_input.clear()  # Clear any existing value
        # Use absolute path to the file
        # Find the first file in the folder
        conservancy_file_path = None
        if os.path.exists(UPLOAD_C_FOLDER):
            for filename in os.listdir(UPLOAD_C_FOLDER):
                file_path = os.path.join(UPLOAD_C_FOLDER, filename)
                if os.path.isfile(file_path):
                    conservancy_file_path = file_path
                    break  # Use the first file found

        if conservancy_file_path is None:
            raise FileNotFoundError("No conservancy file found in c_uploads folder.")

        # Use conservancy_file_path in your selenium code:
        file_input.send_keys(conservancy_file_path)
        print(f"Using conservancy file: {conservancy_file_path}")
        submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Submit"]')
        submit_button.click()

        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.XPATH, "//table"))
        )

        if not driver.find_elements(By.XPATH, "//table"):
            # Print the error message
            print("No results table found after submission.")
            raise TimeoutException("No results table found after submission.")

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

if __name__ == "__main__":
    peptides = ["YLQPRTFLL", "FIAGLIAIV", "KAFSPEVIPMF", "KTFPPTEPK"]
    results = IEDB_conservancy_analysis(peptides)
    print("Conservancy results:", results)