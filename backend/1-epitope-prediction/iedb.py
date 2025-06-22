import requests
import json
import time

url = "https://api-nextgen-tools.iedb.org/api/v1/pipeline"
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


headers = {
    "accept": "application/json",
    "Content-Type": "application/json"
}

# Send POST request
response = requests.post(url, headers=headers, data=json.dumps(payload))

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

# print("Final result:", json.dumps(result, indent=2))

#### READING RESULTS ####

peptide_table = None
for entry in result["data"]["results"]:
    if entry["type"] == "peptide_table":
        peptide_table = entry
        break

if not peptide_table:
    raise ValueError("No peptide table found in results.")

columns = peptide_table["table_columns"]
data = peptide_table["table_data"]
column_indices = {col["name"]: i for i, col in enumerate(columns)}
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




####### ========= NEW REQUEST WITH DIFFERENT METHOD ============= #######

url = "https://api-nextgen-tools.iedb.org/api/v1/pipeline"
print("NEW REQUEST WITH DIFFERENT METHOD: netctl")
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
                        "type": "processing",
                        "method": "netctl"
                    }
                ]
            }
        }
    ]
}

headers = {
    "accept": "application/json",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
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

    if result_data.get("status") == "error":
        print("Error in processing:", result_data.get("error_message"))
        break
    if time.time() - start_time > 30:
        print("Timeout reached while waiting for results.")
    
    print("Waiting for results...")
    time.sleep(2)

# print("Final result:", json.dumps(result, indent=2))

#### READING RESULTS ####
peptide_table = None
for entry in result["data"]["results"]:
    if entry["type"] == "peptide_table":
        peptide_table = entry
        break

if not peptide_table:
    raise ValueError("No peptide table found in results.")

columns = peptide_table["table_columns"]
data = peptide_table["table_data"]

column_indices = {col["name"]: i for i, col in enumerate(columns)}
peptide_idx = column_indices.get("peptide")
score_idx = column_indices.get("predictions_score") or column_indices.get("netctl_score")

if peptide_idx is None or score_idx is None:
    raise ValueError("Required columns ('peptide', 'score') not found.")

top_peptides = sorted(data, key=lambda row: float(row[score_idx]), reverse=True)[:10]

peptide_data = [
    {
        "sequence": row[peptide_idx],
        "netctl_score": float(row[score_idx])
    }
    for row in top_peptides
]

print("Top 10 peptides with scores:")
print(peptide_data)