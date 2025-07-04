from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, Request
import os
from pydantic import BaseModel
from typing import List
from step1_epitope_prediction.iedb import IEDB_epitope_prediction
from step2_conservancy_analysis.iedb import IEDB_conservancy_analysis
import pandas as pd
from step3_antigenicity_screening.vaxijen_script import Vaxijen
from step4_allergenicity_screening.algpred2 import AlgPred2
from step5_toxicity_screening.toxinpred import ToxinPred

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# To run the server, use the command:
# fastapi dev main.py

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/uploadfile/")
async def create_upload_file(file_uploads: list[UploadFile], request: Request):
    """
    Handles file uploads.
    Returns a list of successfully uploaded filenames.
    """

    filenames = []
    for file_upload in file_uploads:
        data = await file_upload.read()
        save_to = os.path.join(UPLOAD_FOLDER, file_upload.filename)
        with open(save_to, 'wb') as f:
            f.write(data)
        filenames.append(file_upload.filename)

    return {"filenames": filenames}

class EpitopePredictionRequest(BaseModel):
    sequence: str
    alleles: str
    methods: List[str]

@app.post("/epitope_prediction/")
async def epitope_prediction(request: EpitopePredictionRequest):
    """
    Function for epitope prediction via. IEDB Script.
    """
    # Here you would call your epitope prediction logic
    print("Received epitope prediction request:")
    output = IEDB_epitope_prediction(request.sequence, request.alleles, request.methods)
    print("Output from IEDB:", output)
    return output

class ConservancyAnalysisRequest(BaseModel):
    peptides: List[str]
    protein_sequence: str

@app.post("/conservancy_analysis/")
async def conservancy_analysis(request: ConservancyAnalysisRequest):
    """
    Function for conservancy analysis via. IEDB Script.
    """
    result = IEDB_conservancy_analysis(request.peptides, request.protein_sequence)
    print("Conservancy Analysis Result:", result)
    return result

class AntigenicityRequest(BaseModel):
    peptides: List[str]

@app.post("/antigenicity_screening/")
async def antigenicity_screening(request: AntigenicityRequest):
    """
    Antigenicity screening via Vaxijen
    """
    # 1. Convert peptides list to DataFrame
    df = pd.DataFrame({"Sequences": request.peptides})

    # 2. Save to CSV (if Vaxijen requires a file)
    df.to_csv("input_sequences.csv", index=False)

    # 3. Run Vaxijen function
    result_df = Vaxijen(df, target='virus', threshold=0.4)

    # 4. Optionally save results
    result_df.to_csv("vaxijen_results.csv", index=False)
    print("Antigenicity Screening Results:", result_df)
    print("Antigenicity Screening Results in DICT:", result_df.to_dict(orient="records"))
    # 5. Return results as JSON
    return result_df.to_dict(orient="records")

@app.post("/allergenicity_screening/")
async def allergenicity_screening(request: AntigenicityRequest):
    """
    Allergenicity screening via AllerTOP and AlgPred2
    """
    # Run AlgPred2
    print("Received allergenicity screening request with peptides:", request.peptides)
    algpred2_results = AlgPred2(request.peptides)

    # Combine results
    combined_results = {
        "algpred2": algpred2_results["results"]
    }

    print("Allergenicity Screening Results:", combined_results)
    return combined_results

@app.post("/toxicity_screening/")
async def toxicity_screening(request: AntigenicityRequest):
    """
    Toxicity screening via ToxinPred
    """
    # Placeholder for ToxinPred logic
    print("Received toxicity screening request with peptides:", request.peptides)
    toxinpred_results = ToxinPred(request.peptides)
    print("ToxinPred Results:", toxinpred_results)
    return toxinpred_results