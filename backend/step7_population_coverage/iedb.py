from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from typing import List

def get_population_coverage(epitope_and_alleles: List[dict]):

    # ✅ Your epitope list
    # epitope_list = [
    #     "YLQPRTFLL",
    #     "FIAGLIAIV",
    #     "VLNDILSRL",
    #     "VLYENQKLI",
    #     "RLQSLQTYV",
    #     "KIADYNYKL",
    #     "RLDKVEAEV",
    #     "WTFGAGAAL",
    #     "IIRGWIFGT",
    #     "FVSNGTHWF"
    # ]

    # 1️⃣ Setup Selenium
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
        # 2️⃣ Open Population Coverage tool
        driver.get("http://tools.iedb.org/population/")

        number_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "id_number"))
        )

        # ✅ Clear any existing value and type "10"
        number_input.clear()
        number_input.send_keys("10")

        # ✅ Now find the "Set" button next to it
        # Usually it's an input[type="submit"] or button element near the input
        # You can find it using XPath relative to the input

        set_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//input[@id='id_number']/following::button[contains(@class,'add_field_button')][1]"
            ))
        )

        # ✅ Click the "Set" button
        set_button.click()

        print("✅ Number set to 10 and 'Set' button clicked.")


        # 2️⃣ Select “World” option from the population dropdown
        # This assumes there is a <select> element for the population choices
        population_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "population_list"))
        )
        select = Select(population_dropdown)
        # select.select_by_value("World")
        # print("Selected population: World")
        for option in select.options:
            color = option.get_attribute("style")
            print(f'Option: {option.get_attribute("value")}, Style: {color}')
            if "green" in color or "red" in color:
                select.select_by_value(option.get_attribute("value"))
        print(f"Selected {len(select.options)} populations.")

        # 3️⃣ Click the “Class I” checkbox or radio button
        # Adjust the locator to match your page — this is a common pattern:
        class1_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='checkbox'][@value='I']"))
        )
        if not class1_checkbox.is_selected():
            class1_checkbox.click()
        print("Selected Class I option")


        # 3️⃣ Wait for input table to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'popcov')]"))
        )
        print("✅ Table loaded!")

        peptide_inputs = driver.find_elements(By.XPATH, "//table[contains(@class,'popcov')]//input[@type='text']")

        print(f"Found {len(peptide_inputs)} input boxes.")



        # Make sure you have enough input fields
        if len(peptide_inputs) < len(epitope_and_alleles):
            raise ValueError(f"Expected at least {len(epitope_and_alleles['sequence'])} input boxes, found {len(peptide_inputs)}")

        # hla_alleles = [{seq: str, alleles: List[str]}]
        print("EPITOPE AND ALLELES:", epitope_and_alleles)
        for entry in epitope_and_alleles:
            epitope = entry['sequence']
            hla_alleles = entry['alleles']
            idx = epitope_and_alleles.index(entry) + 1
            print(f"Entering epitope {idx}: {epitope} with alleles: {hla_alleles}")
            peptide_cell = driver.find_element(By.XPATH, f"(//table[contains(@class,'popcov')]//td[1]/input[@type='text' and @name='epitope'])[{idx}]")
            hla_cell = driver.find_element(By.XPATH, f"(//table[contains(@class, 'popcov')]//td[2]/input[@type='text' and @name='allele'])[{idx}]")

            peptide_cell.clear()
            peptide_cell.send_keys(epitope)

            hla_cell.clear()
            # Send corresponding index of allele in allele list
            hla_cell.send_keys(hla_alleles[idx - 1])
            # time.sleep(1) 

        print("✅ All epitopes and HLA alleles entered!")

        # 6️⃣ Click Submit
        submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Submit"]')
        submit_button.click()
        print("🚀 Submitted! Waiting for results...")

        # 7️⃣ Wait for results table
        # table = WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class,'popcov')]")))

        # Find the row with "World"
        # world_row = table.find_element(By.XPATH, ".//tr[td/a[normalize-space(text())='World']]")


        # world_row = WebDriverWait(driver, 60).until(
        #     EC.presence_of_element_located(
        #         (By.XPATH, "//table[contains(@class, 'popcov')]//tr[td/a[normalize-space(text())='World']]")
        #     )
        # )

        # # Extract all the cells in the row
        # cells = world_row.find_elements(By.TAG_NAME, "td")

        # # Defensive: check we have enough cells
        # if len(cells) < 4:
        #     raise ValueError(f"Expected at least 4 cells in 'World' row, found {len(cells)}.")

        # # Clean up the coverage: remove '%' and convert to float
        # coverage_raw = cells[1].text.strip().replace('%', '')

        # # Build your result dictionary
        # world_result = {
        #     "population": cells[0].text.strip(),
        #     "coverage": float(coverage_raw),
        #     "average_hit": float(cells[2].text.strip()),
        #     "pc90": float(cells[3].text.strip())
        # }

        # print("✅ Population Coverage Result for World:")
        # print(world_result)
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

                # Convert safely to floats
                result = {
                    "population": population,
                    "coverage": float(coverage_raw) if coverage_raw else None,
                    "average_hit": float(average_hit) if average_hit else None,
                    "pc90": float(pc90) if pc90 else None
                }

                results.append(result)
            except Exception as e:
                print(f"⚠️ Skipped row due to parsing error: {e}")
                continue

        print(f"✅ Extracted {len(results)} population rows.")
        for r in results:
            print(r)
        return results
    finally:
        # 8️⃣ Close the browser
        driver.quit()
        print("✅ Browser closed.")

if __name__ == "__main__":
    # Example test data — adjust to match your real structure
    test_epitopes = [
        {"sequence": "YLQPRTFLL", "alleles": ["HLA-A*02:01"]},
        {"sequence": "FIAGLIAIV", "alleles": ["HLA-A*02:06"]},
        {"sequence": "VLNDILSRL", "alleles": ["HLA-B*08:01"]},
        {"sequence": "VLYENQKLI", "alleles": ["HLA-A*03:01"]},
        {"sequence": "RLQSLQTYV", "alleles": ["HLA-A*24:02"]},
        {"sequence": "KIADYNYKL", "alleles": ["HLA-A*11:01"]},
        {"sequence": "RLDKVEAEV", "alleles": ["HLA-A*68:01"]},
        {"sequence": "WTFGAGAAL", "alleles": ["HLA-A*02:01"]},
        {"sequence": "IIRGWIFGT", "alleles": ["HLA-A*02:01"]},
        {"sequence": "FVSNGTHWF", "alleles": ["HLA-B*07:02"]}
    ]

    try:
        print("🚀 Starting population coverage debugging run...")
        results = get_population_coverage(test_epitopes)
        print("\n🎯 Final extracted results:")
        for r in results:
            print(r)
    except Exception as e:
        print("❌ Error during execution:", e)