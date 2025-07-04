from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
import pickle

driver = webdriver.Chrome()  
pickle.dump(driver.get_cookies(), open("cookies.pkl", "wb"))

driver.get("https://www.ddg-pharmfac.net/vaxijen/VaxiJen/VaxiJen.html")
for cookie in pickle.load(open("cookies.pkl", "rb")):
    driver.add_cookie(cookie)
driver.refresh()

epitope_list = [
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

for epitope in epitope_list:
    seq_box = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.NAME, "seq"))
    )
    seq_box.clear()
    seq_box.send_keys(epitope)
    
    model_dropdown = Select(driver.find_element(By.NAME, "Target"))
    model_dropdown.select_by_value("virus")
    
    submit_button = driver.find_element(By.NAME, "Submit")
    submit_button.click()
    
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//table"))
    )
    
    result_table = driver.find_element(By.XPATH, "//table").text
    print(f"\nResult for epitope: {epitope}")
    print(result_table)

    driver.back()
    time.sleep(1)

driver.quit()
