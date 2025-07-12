from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


def get_population_coverage(epitope_list: list[str], hla_alleles: list[str]):

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
    driver = webdriver.Chrome()

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
        select.select_by_value("World")
        print("Selected population: World")

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
        if len(peptide_inputs) < len(epitope_list):
            raise ValueError(f"Expected at least {len(epitope_list)} input boxes, found {len(peptide_inputs)}")


        for idx, epitope in enumerate(epitope_list, start=1):
            peptide_cell = driver.find_element(By.XPATH, f"(//table[contains(@class,'popcov')]//td[1]/input[@type='text' and @name='epitope'])[{idx}]")
            hla_cell = driver.find_element(By.XPATH, f"(//table[contains(@class, 'popcov')]//td[2]/input[@type='text' and @name='allele'])[{idx}]")

            peptide_cell.clear()
            peptide_cell.send_keys(epitope)

            hla_cell.clear()
            hla_cell.send_keys(", ".join(hla_alleles))
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


        world_row = WebDriverWait(driver, 60).until(
            EC.presence_of_element_located(
                (By.XPATH, "//table[contains(@class, 'popcov')]//tr[td/a[normalize-space(text())='World']]")
            )
        )

        # Extract all the cells in the row
        cells = world_row.find_elements(By.TAG_NAME, "td")

        # Defensive: check we have enough cells
        if len(cells) < 4:
            raise ValueError(f"Expected at least 4 cells in 'World' row, found {len(cells)}.")

        # Clean up the coverage: remove '%' and convert to float
        coverage_raw = cells[1].text.strip().replace('%', '')

        # Build your result dictionary
        world_result = {
            "population": cells[0].text.strip(),
            "coverage": float(coverage_raw),
            "average_hit": float(cells[2].text.strip()),
            "pc90": float(cells[3].text.strip())
        }

        print("✅ Population Coverage Result for World:")
        print(world_result)
        return world_result
    finally:
        # 8️⃣ Close the browser
        driver.quit()
        print("✅ Browser closed.")