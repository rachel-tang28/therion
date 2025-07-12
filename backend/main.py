from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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
from step6_cytokine_analysis.run_c_imm_sim import CImmSim
from step7_population_coverage.iedb import get_population_coverage
from fastapi.responses import JSONResponse, FileResponse



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")

# To run the server, use the command:
# fastapi dev main.py

# Global variables
# Global variable to store the uploaded sequence
global_sequence: str = ""
global_alleles: List[str] = []

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload_file/")
async def create_upload_file(file_uploads: list[UploadFile], request: Request):
    """
    Handles file uploads.
    Returns a list of successfully uploaded filenames.
    """

    filenames = []
    for file_upload in file_uploads:
        data = await file_upload.read()
        print(f"Sequence from file {data}")
        # Convert into FASTA format string
        fasta_sequence = f"{data.decode('utf-8')}"
        # Store the sequence in the global variable
        global global_sequence
        global_sequence = fasta_sequence
        print(f"FASTA Sequence: {fasta_sequence}")
        save_to = os.path.join(UPLOAD_FOLDER, file_upload.filename)
        with open(save_to, 'wb') as f:
            f.write(data)
        filenames.append(file_upload.filename)

    return {"filenames": filenames}

class SequenceUpload(BaseModel):
    sequence: str

@app.post("/upload_sequence/")
async def upload_sequence(request: SequenceUpload):
    """
    Handles sequence uploads.
    Returns the uploaded sequence.
    """
    print("Received sequence:", request.sequence)
    global global_sequence
    global_sequence = request.sequence
    return {"sequence": request.sequence}

class AlleleUpload(BaseModel):
    alleles: List[str]

@app.post("/upload_alleles/")
async def upload_alleles(request: AlleleUpload):
    """
    Handles allele uploads.
    Returns the uploaded alleles.
    """
    print("Received alleles:", request.alleles)
    global global_alleles
    global_alleles = request.alleles
    # Here you would handle the alleles as needed
    return {"alleles": request.alleles}

class EpitopePredictionRequest(BaseModel):
    alleles: str
    methods: List[str]

@app.post("/epitope_prediction/")
async def epitope_prediction(request: EpitopePredictionRequest):
    """
    Function for epitope prediction via. IEDB Script.
    """
    # Here you would call your epitope prediction logic
    print("Received epitope prediction request:")
    output = IEDB_epitope_prediction(global_sequence, request.alleles, request.methods)
    print("Output from IEDB:", output)
    return output

class ConservancyAnalysisRequest(BaseModel):
    peptides: List[str]

@app.post("/conservancy_analysis/")
async def conservancy_analysis(request: ConservancyAnalysisRequest):
    """
    Function for conservancy analysis via. IEDB Script.
    """
    result = IEDB_conservancy_analysis(request.peptides, global_sequence)
    print("Conservancy Analysis Result:", result)
    # Extract seuences and conservation scores
    cleaned_results = []
    for row in result["results"]:
        sequence = row[2]
        conservation_raw = row[5]  # e.g. "100.00%"
        conservation_score = float(conservation_raw.strip('%'))
        cleaned_results.append({
            "sequence": sequence,
            "conservation_score": conservation_score
        })
    print("Cleaned Conservancy Results:", cleaned_results)
    return cleaned_results

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

    # Extract the sequence name and prediction from AlgPred2 results
    print("AlgPred2 Results:", algpred2_results)

    return algpred2_results

@app.post("/toxicity_screening/")
async def toxicity_screening(request: AntigenicityRequest):
    """
    Toxicity screening via ToxinPred
    """
    # Placeholder for ToxinPred logic
    print("Received toxicity screening request with peptides:", request.peptides)
    toxinpred_results = ToxinPred(request.peptides)
    print("ToxinPred Results:", toxinpred_results["results"])
    return toxinpred_results

@app.post("/cytokine_analysis/")
async def cytokine_analysis():
    """
    Cytokine analysis via C-ImmSim
    """

    print("Received cytokine analysis request with sequence:", global_sequence)
    # Call the C-ImmSim function with the provided sequence
    result = CImmSim(global_sequence)
    print("C-ImmSim Result:", result)
    return result

@app.post("/population_coverage/")
async def population_coverage(request: AntigenicityRequest):
    """
    Population coverage via IEDB
    """
    print("Received population coverage request with epitopes:", request.peptides)
    print("Received HLA alleles:", global_alleles)

    # Call the get_population_coverage function with the provided epitopes and HLA alleles
    result = get_population_coverage(request.peptides, global_alleles)
    print("Population Coverage Result:", result)
    
    return result

@app.get("/static/{filename}")
async def get_image(filename: str):
    file_path = os.path.join("results", filename)
    return FileResponse(file_path)