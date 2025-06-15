import requests
import json
import time

# Define the URL
url = "https://api-nextgen-tools.iedb.org/api/v1/pipeline"

# Define the payload
payload = {
    "pipeline_id": "",
    "run_stage_range": [1, 1],
    "stages": [
        {
            "stage_number": 1,
            "tool_group": "mhci",
            "input_sequence_text": ">SARS2 spike glycoprotein\nMFVFLVLLPLVSSQCVNLTTRTQLPPAYTNSFTRGVYYPDKVFRSSVLHSTQDLFLPFFSNVTWFHAIHVSGTNGTKRFDNPVLPFNDGVYFASTEKSNIIRGWIFGTTLDSKTQSLLIVNNATNVVIKVCEFQFCNDPFLGVYYHKNNKSWMESEFRVYSSANNCTFEYVSQPFLMDLEGKQGNFKNLREFVFKNIDGYFKIYSKHTPINLVRDLPQGFSALEPLVDLPIGINITRFQTLLALHRSYLTPGDSSSGWTAGAAAYYVGYLQPRTFLLKYNENGTITDAVDCALDPLSETKCTLKSFTVEKGIYQTSNFRVQPTESIVRFPNITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNSASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGKIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTNGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNFNFNGLTGTGVLTESNKKFLPFQQFGRDIADTTDAVRDPQTLEILDITPCSFGGVSVITPGTNTSNQVAVLYQDVNCTEVPVAIHADQLTPTWRVYSTGSNVFQTRAGCLIGAEHVNNSYECDIPIGAGICASYQTQTNSPRRARSVASQSIIAYTMSLGAENSVAYSNNSIAIPTNFTISVTTEILPVSMTKTSVDCTMYICGDSTECSNLLLQYGSFCTQLNRALTGIAVEQDKNTQEVFAQVKQIYKTPPIKDFGGFNFSQILPDPSKPSKRSFIEDLLFNKVTLADAGFIKQYGDCLGDIAARDLICAQKFNGLTVLPPLLTDEMIAQYTSALLAGTITSGWTFGAGAALQIPFAMQMAYRFNGIGVTQNVLYENQKLIANQFNSAIGKIQDSLSSTASALGKLQDVVNQNAQALNTLVKQLSSNFGAISSVLNDILSRLDKVEAEVQIDRLITGRLQSLQTYVTQQLIRAAEIRASANLAATKMSECVLGQSKRVDFCGKGYHLMSFPQSAPHGVVFLHVTYVPAQEKNFTTAPAICHDGKAHFPREGVFVSNGTHWFVTQRNFYEPQIITTDNTFVSGNCDVVIGIVNNTVYDPLQPELDSFKEELDKYFKNHTSPDVDLGDISGINASVVNIQKEIDRLNEVAKNLNESLIDLQELGKYEQYIKWPWYIWLGFIAGLIAIVMVTIMLCCMTSCCSCLKGCCSCGSCCKFDEDDSEPVLKGVKLHYT",
            "input_parameters": {
                "alleles": "HLA-A*02:01",
                "peptide_length_range": [9, 9],
                "predictors": [
                    {
                        "type": "binding",
                        "method": "netmhcpan_el"
                    }
                ]
            }
        }
    ]
}

# Set headers
headers = {
    "accept": "application/json",
    "Content-Type": "application/json"
}

# Send POST request
response = requests.post(url, headers=headers, data=json.dumps(payload))

# Check and print response
if response.status_code == 200:
    print("Success!")
    print(json.dumps(response.json(), indent=2))
    result_id = response.json().get("result_id")
else:
    print(f"Error {response.status_code}")
    print(response.text)

#### GETTING RESULTS ####

url = f"https://api-nextgen-tools.iedb.org/api/v1/results/{result_id}"
headers = {"accept": "application/json"}

start_time = time.time()
while True:
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error {response.status_code}: {response.text}")
    
    result_data = response.json()
    print("Current status:", result_data.get("status"))
    if result_data.get("status") == "done":
        result = result_data
        print("Results are ready!")
        break

    
    if time.time() - start_time > 30:
        print("Timeout reached while waiting for results.")
    
    print("Waiting for results...")
    time.sleep(2)

print("Final result:", json.dumps(result, indent=2))

#### READING RESULTS ####

# Find the peptide table
peptide_table = None
for entry in result["data"]["results"]:
    if entry["type"] == "peptide_table":
        peptide_table = entry
        break

if not peptide_table:
    raise ValueError("No peptide table found in results.")

# Extract columns and data
columns = peptide_table["table_columns"]
data = peptide_table["table_data"]

# Map column names to indices
column_indices = {col["name"]: i for i, col in enumerate(columns)}

# Safely get the indices for "peptide" and "score"
peptide_idx = column_indices.get("peptide")
score_idx = column_indices.get("score") or column_indices.get("netmhcpan_el_score")

if peptide_idx is None or score_idx is None:
    raise ValueError("Required columns ('peptide', 'score') not found.")

# Filter and sort data by score descending
top_peptides = sorted(data, key=lambda row: float(row[score_idx]), reverse=True)[:10]

# Build dictionary list
peptide_data = [
    {
        "sequence": row[peptide_idx],
        "combined_score": float(row[score_idx])
    }
    for row in top_peptides
]

# Output
print("Top 10 peptides with scores:")
print(peptide_data)