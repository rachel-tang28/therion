import requests
import json
import time

# === Configuration for methods ===
METHOD_CONFIG = {
    "netmhcpan_el": {
        "tool_group": "mhci",
        "type": "binding",
        "method": "netmhcpan_el",
        "score_column": "netmhcpan_el_score"
    },
    "netctl": {
        "tool_group": "mhci",
        "type": "processing",
        "method": "netctl",
        "score_column": "netctl_score"
    }
}


def run_method(sequence: str, alleles: str, method_name: str):
    """
    Runs a single prediction method and returns a list of peptide scores.
    """
    config = METHOD_CONFIG[method_name]
    url = "https://api-nextgen-tools.iedb.org/api/v1/pipeline"
    # === Submit job ===
    payload = {
        "pipeline_id": "",
        "run_stage_range": [1, 1],
        "stages": [
            {
                "stage_number": 1,
                "tool_group": config["tool_group"],
                "input_sequence_text": sequence,
                "input_parameters": {
                    "alleles": alleles,
                    "peptide_length_range": [9, 9],
                    "predictors": [
                        {
                            "type": config["type"],
                            "method": config["method"]
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
        result_id = response.json().get("result_id")

    #### GETTING RESULTS ####

    url = f"https://api-nextgen-tools.iedb.org/api/v1/results/{result_id}"
    headers = {"accept": "application/json"}

    start_time = time.time()
    while True:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            pass
        
        result_data = response.json()
        if result_data.get("status") == "done":
            result = result_data
            break

        if result_data.get("status") == "error":
            break
        if time.time() - start_time > 30:
            pass
        if time.time() - start_time > 80:
            pass
        time.sleep(2)

    #### READING RESULTS ####

    output_filename = "iedb_output.json"
    with open(output_filename, "w") as f:
        json.dump(result, f, indent=2)

    peptide_table = None
    for entry in result["data"]["results"]:
        if entry["type"] == "peptide_table":
            peptide_table = entry
            break

    if not peptide_table:
        raise ValueError("No peptide table found in results.")

    columns = peptide_table["table_columns"]
    data_rows = peptide_table["table_data"]
    col_idx = {col["name"]: i for i, col in enumerate(columns)}

    peptide_idx = col_idx.get("peptide")
    score_idx = col_idx.get(config["score_column"]) or col_idx.get("predictions_score")
    allele = col_idx.get("allele")
    if peptide_idx is None or score_idx is None or allele is None:
        raise ValueError(f"Columns not found: peptide or {config['score_column']} or allele")

    top_peptides = sorted(data_rows, key=lambda r: float(r[score_idx]), reverse=True)[:10]

    result = [
        {"sequence": row[peptide_idx], "score": float(row[score_idx]), "allele": row[allele]}
        for row in top_peptides
    ]

    # Find all instances of each top peptide in the table_data, and get corresponding allele
    hla_alleles = []
    for p in result:
        sequence = p["sequence"]
        alleles = [row[allele] for row in data_rows if row[peptide_idx] == p["sequence"]]
        hla_alleles.append({
            "sequence": p["sequence"],
            "alleles": alleles
        })

    return result, hla_alleles


def IEDB_epitope_prediction(sequence: str, alleles: str, methods: list):
    """
    Runs all selected methods and combines the results into a consensus.
    """
    combined = {}
    allele_by_sequence = {}
    
    for method in methods:
        results, hla_alleles = run_method(sequence, alleles, method)
        for rank, entry in enumerate(results):
            seq = entry["sequence"]
            score = entry["score"]
            allele = entry["allele"]
            weight = len(results) - rank

            # Add weighted score
            combined.setdefault(seq, 0)
            combined[seq] += score * weight

            # Store allele the first time this seq is seen
            if seq not in allele_by_sequence:
                allele_by_sequence[seq] = allele
    
    consensus = [
        {
            "sequence": seq,
            "weighted_score": combined_score,
            "allele": allele_by_sequence[seq]  # correct allele
        }
        for seq, combined_score in combined.items()
    ]

    consensus.sort(key=lambda x: x["weighted_score"], reverse=True)
    return consensus, hla_alleles
