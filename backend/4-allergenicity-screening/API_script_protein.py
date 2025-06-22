#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Mar 20 14:50:06 2025

script to perform predictions using the AllergyPred API

@author: emanuelkemmler
"""

import requests    #Server interaction
import argparse    #Command line switch handling
import pandas as pd
from io import StringIO

parser=argparse.ArgumentParser(description="Query the AllergyPred API")
parser.add_argument("AA_string", help="The amino acid strings to predict (comma-separated).",type=str)
args=parser.parse_args()

inputs = args.AA_string.replace(" ", "").split(',')

print('Processing query(s). This may take up to 30 seconds per query.')
data=pd.DataFrame()
for aa_seq in inputs:
    response=requests.post("https://allergypred.charite.de/AllergyPred/subpages/api_enqueue.php",data={'input':aa_seq})
    if response.status_code == 429 or response.status_code == 403:
        print(response.text)
    result = response.text
    csvStringIO = StringIO(result)
    df = pd.read_csv(csvStringIO, sep=";")
    data=pd.concat([data, df], ignore_index=True)


data.to_csv("./AllergyPred_results.csv", sep='\t')

