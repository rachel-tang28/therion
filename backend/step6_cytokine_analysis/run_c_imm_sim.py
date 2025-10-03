from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
import os
from datetime import datetime

def CImmSim(protein_sequence: str):
    """
    Automates the C-ImmSim web server to submit a protein sequence for simulation.
    Returns the output link and image of the simulation results.
    """

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
    
    # 1️⃣ Setup Selenium browser (Chrome)
    # driver = webdriver.Chrome()  # Make sure chromedriver is installed & in PATH\
    # This will always point to the folder where main.py lives
    PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))  # This is step6_cytokine_analysis/
    STATIC_DIR = os.path.join(PROJECT_ROOT, "..", "static")    # This goes up one level to project_root/static/
    try:
        # 2️⃣ Open C-ImmSim server
        driver.get("https://kraken.iac.rm.cnr.it/C-IMMSIM/index.php")

        # 3️⃣ Fill in email and password
        email_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        email_box.send_keys("rachell.tang28@gmail.com")

        password_box = driver.find_element(By.NAME, "p")
        password_box.send_keys("123")

        # 4️⃣ Submit login form
        login_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="Login"]')
        login_button.click()

        # 5️⃣ Wait for the simulation page to load
        # (This depends on what you want to do — for now we assume a simulation is already submitted)
        print("Logged in!")

        # 4️⃣ Wait for job input page
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "inj1_IdProtLong1"))
        )

        # 5️⃣ Fill in Antigen sequence
        sequence = """>4D2I_1
        MIIGYVIGQATTQEALILAERPVRLGTYVVLEYDNVKALGLITNVTRGSPLLDDNMNDIEIVQRLKQFNNSIPVYTKAKVKLLCDMNNHFLMPDIPPFAGTPAREAEDEELKSIYSQDGQIRIGSLIGKNVEVKLNINSFARHLAILAATGSGKSNTVAVLSQRISELGGSVLIFDYHGEYYDSDIKNLNRIEPKLNPLYMTPREFSTLLEIRENAIIQYRILRRAFIKVTNGIRAALAAGQIPFSTLNSQFYELMADALETQGNSDKKSSAKDEVLNKFEEFMDRYSNVIDLTSSDIIEKVKRGKVNVVSLTQLDEDSMDAVVSHYLRRILDSRKDFKRSKNSGLKFPIIAVIEEAHVFLSKNENTLTKYWASRIAREGRKFGVGLTIVSQRPKGLDENILSQMTNKIILKIIEPTDKKYILESSDNLSEDLAEQLSSLDVGEAIIIGKIVKLPAVVKIDMFEGKLLGSDPDMIGEWKKVAASEKIAKGFADFGTEIGD"""

        protein_box = driver.find_element(By.NAME, "inj1_IdProtLong1")
        protein_box.clear()
        protein_box.send_keys(sequence)

        print("✅ Input sequence added!")
        # cookie_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Accept')]")
        # cookie_button.click()

        # print page content for debugging
        # print("Page content after input:", driver.page_source)

        # 6️⃣ Submit the job
        submit_button = driver.find_element(By.XPATH, '//input[@type="submit" and @value="SUBMIT JOB"]')
        submit_button.click()

        print("✅ Job submitted! Waiting for it to finish...")

        # 7️⃣ Wait for TERMINATED PROCESSES table
        terminated_table = WebDriverWait(driver, 180).until(
            EC.presence_of_element_located((By.XPATH, "//table[contains(., 'normal termination')]"))
        )
        print("✅ Job terminated, output ready.")

        # 8️⃣ Get OUTPUT link
        output_link = driver.find_element(By.XPATH, "//table//tr[3]//td[5]/a")
        output_href = output_link.get_attribute("href")
        print("🔗 Output page link:", output_href)

        # 9️⃣ Visit output page
        driver.get(output_href)

        # 1️⃣0️⃣ Find result image & download
        result_img = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "//img"))
        )
        img_url = result_img.get_attribute("src")
        print("🖼️ Image URL:", img_url)

        driver.get(img_url)

        filename = f"cimmsim_result_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.png"
        save_path = ("./static/" + filename).replace("/", os.sep)
        print("Saving image to:", save_path)

        # Right-click save approach: take a screenshot of the image element
        result_img = driver.find_element(By.XPATH, "//img")
        result_img.screenshot(save_path)

        print("✅ Image saved using Selenium screenshot")

        # 🔚 Done!
        driver.quit()
        return {
            "filename": f"{filename}"
        }
    except Exception as e:
        print("An error occurred:", e)
        driver.quit()
        return {"error": str(e)}