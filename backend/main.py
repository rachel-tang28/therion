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
from groq import Groq
from dotenv import load_dotenv
load_dotenv()


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable not set.")

client = Groq(
    api_key=api_key,
)

# Print current directory
print("Current Directory:", os.getcwd())

# To run the server, use the command:
# fastapi dev main.py

# Global variables
# Global variable to store the uploaded sequence
global_pipeline_name: str = ""
global_sequence: str = ""
global_conservancy_sequence: str = ""
global_alleles: List[str] = []
global_sequence_and_alleles: List[dict] = []
global_threshold: float = 0.4  # Default threshold for Vaxijen
global_allergenicity_threshold: float = 0.3  # Default threshold for AlgPred2
global_selections: List[str] = []

# Global variables for results
global_results = {
    "epitope_prediction": [],
    "conservancy_analysis": [],
    "antigenicity_screening": [],
    "allergenicity_screening": [],
    "toxicity_screening": [],
    "cytokine_analysis": [],
    "population_coverage": []
}

global_steps: dict = {
        1: True,
        2: True,
        3: True,
        4: True,
        5: True,
        6: True,
        7: True,
        8: True,
}

global_conservancy_parameters = {
    "analysisType": "linear",
    "comparisonOperator": "less",
    "identityThreshold": "100%"
}

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class NameRequest(BaseModel):
    name: str

@app.post("/pipeline_name/")
async def pipeline_name(request: NameRequest):
    """
    Handles the pipeline name.
    Returns a message indicating the pipeline name.
    """
    print("Received request for pipeline name.")
    
    global global_pipeline_name
    if not request.name:
        global_pipeline_name = "Pipeline"
    else:
        global_pipeline_name = request.name
    return {"message": global_pipeline_name}

@app.get("/pipeline_name/")
async def get_pipeline_name():
    """
    Returns the current pipeline name.
    """
    print("Current pipeline name:", global_pipeline_name)
    return {"pipeline_name": global_pipeline_name}

class StepRequest(BaseModel):
    activeSteps: dict

@app.post("/upload_steps/")
async def upload_steps(request: StepRequest):
    """
    Handles the steps upload.
    Returns a message indicating the steps have been uploaded.
    """
    print("Received steps:", request.activeSteps)
    global global_steps
    global_steps = request.activeSteps
    return {"message": f"Steps set to {global_steps}"}

@app.get("/get_steps/")
async def get_steps():
    """
    Returns the current steps.
    """
    print("Current steps:", global_steps)
    return {"steps": global_steps}

### NEW
class ConservancyParameters(BaseModel):
    analysisType: str
    comparisonOperator: str
    identityThreshold: str

@app.post("/upload_conservancy_parameters/")
async def upload_conservancy_parameters(request: ConservancyParameters):
    """
    Handles the conservancy parameters upload.
    Returns a message indicating the conservancy parameters have been uploaded.
    """
    print("Received conservancy parameters:", request.analysisType, request.comparisonOperator, request.identityThreshold)
    global global_conservancy_parameters
    global_conservancy_parameters = {
        "analysisType": request.analysisType,
        "comparisonOperator": request.comparisonOperator,
        "identityThreshold": request.identityThreshold
    }
    return {"message": f"Conservancy parameters set to {global_conservancy_parameters}"}

@app.get("/get_conservancy_parameters/")
async def get_conservancy_parameters():
    """
    Returns the current conservancy parameters.
    """
    print("Current conservancy parameters:", global_conservancy_parameters)
    return {"conservancy_parameters": global_conservancy_parameters}

### END NEW

class ThresholdRequest(BaseModel):
    threshold: float

@app.post("/upload_threshold/")
async def upload_threshold(request: ThresholdRequest):
    """
    Handles the threshold upload.
    Returns a message indicating the threshold value.
    """
    print("Received threshold:", request.threshold)
    global global_threshold
    global_threshold = request.threshold
    return {"message": f"Threshold set to {global_threshold}"}

@app.get("/get_threshold/")
async def get_threshold():
    """
    Returns the current threshold value.
    """
    print("Current threshold:", global_threshold)
    return {"threshold": global_threshold}

@app.post("/upload_allergenicity_threshold/")
async def upload_allergenicity_threshold(request: ThresholdRequest):
    """
    Handles the threshold upload.
    Returns a message indicating the threshold value.
    """
    print("Received threshold:", request.threshold)
    global global_allergenicity_threshold
    global_allergenicity_threshold = request.threshold
    return {"message": f"Allergenicity threshold set to {global_allergenicity_threshold}"}

@app.get("/get_allergenicity_threshold/")
async def get_allergenicity_threshold():
    """
    Returns the current allergenicity threshold value.
    """
    print("Current allergenicity threshold:", global_allergenicity_threshold)
    return {"threshold": global_allergenicity_threshold}

class SelectionsRequest(BaseModel):
    selections: List[str]

@app.post("/upload_selections/")
async def upload_selections(request: SelectionsRequest):
    """
    Handles the upload of selected alleles.
    Returns the uploaded selections.
    """
    print("Received selections:", request.selections)
    global global_selections
    global_selections = request.selections
    return {"selections": global_selections}

@app.get("/get_selections/")
async def get_upload_selections():
    """
    Returns the uploaded selections.
    """
    # Returns as a string, seperated by commas
    print("Current selections:", global_selections)
    return {"selections": ", ".join(global_selections)}

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

UPLOAD_C_FOLDER = "c_uploads"
os.makedirs(UPLOAD_C_FOLDER, exist_ok=True)

@app.post("/upload_conservancy_file/")
async def create_upload_conservancy_file(file_uploads: list[UploadFile], request: Request):
    """
    Handles file uploads.
    Returns a list of successfully uploaded filenames.
    """

    filenames = []
    for file_upload in file_uploads:
        data = await file_upload.read()
        # print(f"Sequence from file {data}")
        # Check it doesn't end in txt, docx, or doc, if so, return error
        if file_upload.filename.endswith(('.txt', '.docx', '.doc')):
            return JSONResponse(
                status_code=400,
                content={"detail": "File must be in FASTA format, not .txt, .docx, or .doc."}
            )
        # Convert into FASTA format string
        fasta_sequence = f"{data.decode('utf-8')}"
        # Store the sequence in the global variable
        global global_sequence
        global_sequence = fasta_sequence
        # print(f"FASTA Sequence: {fasta_sequence}")
        save_to = os.path.join(UPLOAD_C_FOLDER, file_upload.filename)
        with open(save_to, 'wb') as f:
            f.write(data)
        filenames.append(file_upload.filename)

    return {"filenames": filenames}


class ConservancySequenceUpload(BaseModel):
    conservancySequence: str

@app.post("/upload_conservancy_sequence/")
async def upload_conservancy_sequence(request: ConservancySequenceUpload):
    """
    Handles sequence uploads.
    Returns the uploaded sequence.
    """
    # print("Received sequence:", request.conservancySequence)
    global global__conservancy_sequence
    global__conservancy_sequence = request.conservancySequence
    return {"conservancy_sequence": request.conservancySequence}

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
    # print("Received epitope prediction request:")
    output, hla_alleles = IEDB_epitope_prediction(global_sequence, request.alleles, global_selections)
    # print("Output from IEDB:", output)
    # print("HLA Alleles from IEDB:", hla_alleles)
    global global_results
    global_results["epitope_prediction"] = output
    global global_sequence_and_alleles
    global_sequence_and_alleles = hla_alleles
    # print("Global Sequence and Alleles updated:", global_sequence_and_alleles)
    return output

class ConservancyAnalysisRequest(BaseModel):
    peptides: List[str]

@app.post("/conservancy_analysis/")
async def conservancy_analysis(request: ConservancyAnalysisRequest):
    """
    Function for conservancy analysis via. IEDB Script.
    """
    result = IEDB_conservancy_analysis(request.peptides, 
                                       global_conservancy_parameters["analysisType"],
                                       global_conservancy_parameters["comparisonOperator"], 
                                       global_conservancy_parameters["identityThreshold"])
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
    global global_results
    global_results["conservancy_analysis"] = cleaned_results
    print("Global Conservancy Results updated:", global_results["conservancy_analysis"])
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
    result_df = Vaxijen(df, threshold=global_threshold, target='virus')

    # 4. Optionally save results
    result_df.to_csv("vaxijen_results.csv", index=False)
    print("Antigenicity Screening Results:", result_df)
    print("Antigenicity Screening Results in DICT:", result_df.to_dict(orient="records"))
    # 5. Return results as JSON
    global global_results
    global_results["antigenicity_screening"] = result_df.to_dict(orient="records")
    print("Global Antigenicity Results updated:", global_results["antigenicity_screening"])
    return result_df.to_dict(orient="records")

@app.post("/allergenicity_screening/")
async def allergenicity_screening(request: AntigenicityRequest):
    """
    Allergenicity screening via AllerTOP and AlgPred2
    """
    # Run AlgPred2
    print("Received allergenicity screening request with peptides:", request.peptides)
    algpred2_results = AlgPred2(request.peptides, global_allergenicity_threshold)

    # Extract the sequence name and prediction from AlgPred2 results
    print("AlgPred2 Results:", algpred2_results)
    global global_results
    global_results["allergenicity_screening"] = algpred2_results["results"]
    print("Global Allergenicity Results updated:", global_results["allergenicity_screening"])

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
    global global_results
    global_results["toxicity_screening"] = toxinpred_results["results"]
    print("Global Toxicity Results updated:", global_results["toxicity_screening"])
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

class PopCovRequest(BaseModel):
    peptides: List[str]
    alleles: List[str]

@app.post("/population_coverage/")
async def population_coverage(request: PopCovRequest):
    """
    Population coverage via IEDB
    """
    print("Received population coverage request with epitopes:", request.peptides)
    print("Received HLA alleles:", request.alleles)

    # Call the get_population_coverage function with the provided epitopes and HLA alleles
    result = get_population_coverage(global_sequence_and_alleles)
    print("Population Coverage Result:", result)
    global global_results
    global_results["population_coverage"] = result
    print("Global Population Coverage Results updated:", global_results["population_coverage"])
    return result

@app.get("/static/{filename}")
async def get_image(filename: str):
    file_path = os.path.join("results", filename)
    return FileResponse(file_path)

### CHATBOT ENDPOINTS ###
class Message(BaseModel):
    role: str
    content: str

messages = [
    Message(role="ai", content="Hello! I'm *Thio*, your bioinformatics assistant. How can I help you today?"),
]

def generate_system_context():
    def shorten(seq): return seq[:100] + '...' if seq and len(seq) > 100 else (seq or "None")

    context = f"""
    You are Thio, an AI assistant embedded in Therion — a bioinformatics platform for in-silico vaccine design...

    Current known context:
    - Uploaded sequence: {shorten(global_sequence)}
    - Conservancy sequence: {shorten(global_conservancy_sequence)}
    - Selected HLA alleles: {', '.join(global_alleles) if global_alleles else 'None'}
    - Predicted epitopes: {(global_results['epitope_prediction'])}
    - Conserved epitopes: {(global_results['conservancy_analysis'])}
    - Antigenicity screening: {global_results['antigenicity_screening']}
    - Allergenicity screening: {global_results['allergenicity_screening']}
    - Toxicity screening: {global_results['toxicity_screening']}
    - Population coverage: {(global_results['population_coverage'])}
    """.strip()

    return context

@app.get("/chat_messages/")
async def get_chat_messages():
    """
    Endpoint to get all chat messages.
    """
    return {"messages": messages}

@app.post("/chat_messages/")
async def post_chat_messages(request: Message):
    """
    Endpoint to post a new chat message.
    """
    messages.append(Message(role="user", content=request.content))
    api_messages = []

    # system_context = f"""
    # You are Thio, an AI assistant embedded in Therion — a bioinformatics platform for in-silico vaccine design. You help users navigate and interpret a multi-step epitope prediction and vaccine development pipeline.

    # Current known context:
    # - Uploaded sequence: {global_sequence[:100] + '...' if len(global_sequence) > 100 else global_sequence or 'None'}
    # - Conservancy sequence: {global_conservancy_sequence[:100] + '...' if len(global_conservancy_sequence) > 100 else global_conservancy_sequence or 'None'}
    # - Selected HLA alleles: {', '.join(global_alleles) if global_alleles else 'None'}

    # Therion aims to make vaccine design more accessible, accurate, and efficient through centralisation, consensus prediction, and AI-powered interpretation. It integrates various immunoinformatics tools into one intuitive workflow and provides real-time assistance at each step.

    # The typical pipeline includes:
    # 1. **Sequence Retrieval** – from viral databases.
    # 2. **Epitope Prediction** – identifying CTL epitopes likely to bind MHC-I.
    # 3. **Conservancy Analysis** – selecting epitopes conserved across viral strains.
    # 4. **Antigenicity, Allergenicity, Toxicity Screening** – ensuring safety and immunogenicity.
    # 5. **Cytokine Profiling** – predicting immune response activation.
    # 6. **Population Coverage** – assessing HLA allele coverage.
    # 7. **Vaccine Construct Design** – multi-epitope construction and 3D structure modelling.
    # 8. **Docking & Simulation** – binding affinity and biological stability checks.
    # 9. **Codon Optimisation & In-Silico Cloning** – preparing for lab expression.

    # Therion focuses on the first six computational steps of this vaccine design pipeline.

    # Guide the user based on these steps and the inputs above. Provide clear, biologically relevant explanations and assist both technical and non-technical users in interpreting results and selecting next actions.
    # """.strip()
    system_context = generate_system_context()
    print("System Context:", system_context)

    api_messages.append({
        "role": "system",
        "content": system_context
    })

    for m in messages:
        # Map your internal "ai" to "assistant" for the API
        api_role = "assistant" if m.role == "ai" else m.role
        api_messages.append({"role": api_role, "content": m.content})

    chat_completion = client.chat.completions.create(
        messages=api_messages,
        model="llama-3.3-70b-versatile",
    )
    print(chat_completion.choices[0].message.content)
    messages.append(Message(role="ai", content=chat_completion.choices[0].message.content))
    return {"message": "Message added successfully."}

# On refresh or server restart, clear c_upload and upload folder
@app.on_event("shutdown")
async def shutdown_event():
    # Clear the upload folder
    if os.path.exists(UPLOAD_FOLDER):
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
    
    # Clear the c_upload folder
    if os.path.exists(UPLOAD_C_FOLDER):
        for filename in os.listdir(UPLOAD_C_FOLDER):
            file_path = os.path.join(UPLOAD_C_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)