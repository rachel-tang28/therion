from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from typing import List

def get_population_coverage(epitope_and_alleles: List[dict]):

    # Setup Selenium
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
        # Open Population Coverage tool
        driver.get("http://tools.iedb.org/population/")

        number_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "id_number"))
        )

        # Clear any existing value and set number of epitopes to 10
        number_input.clear()
        number_input.send_keys("10")
        set_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//input[@id='id_number']/following::button[contains(@class,'add_field_button')][1]"
            ))
        )
        set_button.click()


        # Select green and red regions from the population dropdown
        population_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "population_list"))
        )
        select = Select(population_dropdown)
        for option in select.options:
            color = option.get_attribute("style")
            if "green" in color or "red" in color:
                select.select_by_value(option.get_attribute("value"))

        # Click the “Class I” checkbox
        class1_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='checkbox'][@value='I']"))
        )
        if not class1_checkbox.is_selected():
            class1_checkbox.click()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'popcov')]"))
        )

        peptide_inputs = driver.find_elements(By.XPATH, "//table[contains(@class,'popcov')]//input[@type='text']")

        # Ensure enough input fields
        if len(peptide_inputs) < len(epitope_and_alleles):
            raise ValueError(f"Expected at least {len(epitope_and_alleles['sequence'])} input boxes, found {len(peptide_inputs)}")

        # hla_alleles = [{seq: str, alleles: List[str]}]
        for entry in epitope_and_alleles:
            epitope = entry['sequence']
            hla_alleles = entry['alleles']
            idx = epitope_and_alleles.index(entry) + 1
            peptide_cell = driver.find_element(By.XPATH, f"(//table[contains(@class,'popcov')]//td[1]/input[@type='text' and @name='epitope'])[{idx}]")
            hla_cell = driver.find_element(By.XPATH, f"(//table[contains(@class, 'popcov')]//td[2]/input[@type='text' and @name='allele'])[{idx}]")

            peptide_cell.clear()
            peptide_cell.send_keys(epitope)

            hla_cell.clear()
            # Send corresponding index of allele in allele list
            hla_cell.send_keys(", ".join(hla_alleles))


        # Submit
        submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Submit"]')
        submit_button.click()

        # Wait for the table to load
        table = WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'popcov')]"))
        )

        # Find all data rows inside the table (skip header if present)
        rows = table.find_elements(By.XPATH, ".//tr[td]")

        results = []

        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) < 4:
                # skip rows that don’t have full data (e.g. empty headers)
                continue

            try:
                population = cells[0].text.strip()
                coverage_raw = cells[1].text.strip().replace('%', '')
                average_hit = cells[2].text.strip()
                pc90 = cells[3].text.strip()

                # Convert to floats
                result = {
                    "population": population,
                    "coverage": float(coverage_raw) if coverage_raw else None,
                    "average_hit": float(average_hit) if average_hit else None,
                    "pc90": float(pc90) if pc90 else None
                }

                results.append(result)
            except Exception as e:
                print(f"Error: {e}")
                continue

        return results
    
    finally:
        driver.quit()
