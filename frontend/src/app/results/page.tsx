"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResultsTable from "@/components/ui/results_table";
import ResultsCompleteTable from "@/components/ui/results_summary";
import RoundIcon from "@/components/ui/round_icon";
import { Loader2, Terminal, Zap, CheckCircle2Icon } from "lucide-react";
import Image from "next/image";
import { Chat } from "@/components/ui/chat";
import AntigenicityTable from "@/components/ui/antigenicity_table";
import AllergenicityTable from "@/components/ui/allergenicity_table";
import ToxicityTable from "@/components/ui/toxicity_table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { FeedbackTab } from "@/components/feedback_tab";

interface ResultEntry {
  sequence: string;
  binding_score: number;
  allele: string;
  rank: number;
}

interface ResultCompleteEntry {
  sequence: string;
  binding_score: number;
  allele: string;
  antigen: boolean;
  allergen: boolean;
  toxin: boolean;
  rank: number;
}

interface ConservancyResult {
  sequence: string;
  conservation_score: number;
}

interface AntigenicityResult {
  sequence: string;
  score: number;
  antigen: boolean;
}

interface AllergenicityResult {
  sequence: string;
  score: number;
  allergen: boolean;
}

interface ToxicityResult {
  sequence: string;
  score: number;
  toxin: boolean;
}

const COLORS = ["#63c184ff", "#df5959ff"];
const FLIPCOLORS = ["#df5959ff", "#63c184ff"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload,
}) => {
  const name = payload.name;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const mockAllergenicityResults: AllergenicityResult[] = [
  { sequence: "LTDEMIAQY", score: 0.12, allergen: false },
  { sequence: "IPFAMQMAY", score: 0.67, allergen: true },
  { sequence: "HADQLTPTW", score: 0.34, allergen: false },
  { sequence: "LPFNDGVYF", score: 0.81, allergen: true },
  { sequence: "QELGKYEQY", score: 0.45, allergen: false },
  { sequence: "LPFFSNVTW", score: 0.76, allergen: true },
  { sequence: "VASQSIIAY", score: 0.22, allergen: false },
  { sequence: "RLFRKSNLK", score: 0.88, allergen: true },
  { sequence: "AEIRASANL", score: 0.30, allergen: false },
  { sequence: "NTQEVFAQV", score: 0.59, allergen: true },
];

const mockToxicityResults: ToxicityResult[] = [
  { sequence: "LTDEMIAQY", score: 0.08, toxin: false },
  { sequence: "IPFAMQMAY", score: 0.54, toxin: false },
  { sequence: "HADQLTPTW", score: 0.71, toxin: true },
  { sequence: "LPFNDGVYF", score: 0.63, toxin: true },
  { sequence: "QELGKYEQY", score: 0.18, toxin: false },
  { sequence: "LPFFSNVTW", score: 0.42, toxin: false },
  { sequence: "VASQSIIAY", score: 0.79, toxin: true },
  { sequence: "RLFRKSNLK", score: 0.24, toxin: false },
  { sequence: "AEIRASANL", score: 0.66, toxin: true },
  { sequence: "NTQEVFAQV", score: 0.37, toxin: false },
];


export default function ResultsPage() {
  const [pipelineName, setPipelineName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [predictedPeptides, setPredictedPeptides] = useState<ResultEntry[]>([]);
  const [conservancyAnalysis, setConservancyAnalysis] = useState<
    ConservancyResult[]
  >([]);
  const [antigenicityScreening, setAntigenicityScreening] = useState<
    AntigenicityResult[]
  >([]);
  const [allergenicityScreening, setAllergenicityScreening] = useState<
    AllergenicityResult[]
  >(mockAllergenicityResults);
  const [toxicityScreening, setToxicityScreening] = useState<ToxicityResult[]>(
    mockToxicityResults
  );
  const [cytokineAnalysis, setCytokineAnalysis] = useState<string>("");
  const [populationCoverage, setPopulationCoverage] = useState<string>("0");
  const [progress, setProgress] = useState(1);
  const [currentMessage, setCurrentMessage] = useState(1);
  const [results, setResults] = useState<ResultCompleteEntry[]>([]);
  const [selections, setSelections] = useState<string>("");
  const [steps, setSteps] = useState<Record<number, boolean>>({});

  const messages = [
    "Processing sequence data...",
    "Mapping potential T-cell epitopes...",
    "Performing conservancy analysis...",
    "Running antigenicity, allergenicity, and toxicity screening...",
    "Performing cytokine analysis...",
    "Population coverage analysis in progress...",
    "Finalising results...",
    "Finalising results...",
    "Finalising results...",
    "Results ready!"
  ];

  const [antigenicityThreshold, setAntigenicityThreshold] = useState<number>(0.4);
  const [allergenicityThreshold, setAllergenicityThreshold] = useState<number>(0.3);

  // // Simulate progress updates
  // useEffect(() => {
  //     const interval = setInterval(() => {
  //     setProgress((prev) => {
  //         if (prev >= 100) {
  //         return 0 // Reset for demo purposes
  //         }
  //         return prev + Math.random() * 15
  //     })
  //     }, 800)

  //     return () => clearInterval(interval)
  // }, [])

  // // Cycle through messages - increase interval for longer text
  // useEffect(() => {
  //     const interval = setInterval(() => {
  //     setCurrentMessage((prev) => (prev + 1) % messages.length)
  //     }, 4000) // Increased from 2000 to 4000ms

  //     return () => clearInterval(interval)
  // }, [messages.length])

  // // Switch between indeterminate and determinate modes
  // useEffect(() => {
  //     const timeout = setTimeout(() => {
  //     setIsIndeterminate(false)
  //     }, 3000)

  //     return () => clearTimeout(timeout)
  // }, [])

  // const estimatedTime = Math.max(1, Math.ceil((100 - progress) / 20))

  async function runScreenings(predictedPeptides: ResultEntry[]) {
    const endpoints = [
      {
        name: "Vaxijen",
        url: process.env.NEXT_PUBLIC_API_ENDPOINT + "antigenicity_screening/",
      },
      // {
      //   name: "AlgPred2",
      //   url: process.env.NEXT_PUBLIC_API_ENDPOINT + "allergenicity_screening/",
      // },
      // {
      //   name: "ToxinPred",
      //   url: process.env.NEXT_PUBLIC_API_ENDPOINT + "toxicity_screening/",
      // },
    ];

    const payload = {
      peptides: predictedPeptides.map((p) => p.sequence),
    };
    
    if (antigenicityScreening.length > 0) {
      endpoints.filter((endpoint) => endpoint.name !== "Vaxijen");
    }
    if (allergenicityScreening.length > 0) {
      endpoints.filter((endpoint) => endpoint.name !== "AlgPred2");
    }
    if (toxicityScreening.length > 0) {
      endpoints.filter((endpoint) => endpoint.name !== "ToxinPred");
    }

    const requests = endpoints.map((endpoint) =>
      fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`${endpoint.name} API request failed`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(`${endpoint.name} results:`, data);
          if (endpoint.name === "Vaxijen") {
            const antigenArray = Array.isArray(data) ? data : data.results;

            fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "get_threshold/", {
              headers: {
                "Content-Type": "application/json",
              }
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to fetch antigenicity threshold");
                }
                return response.json();
              })
              .then((data) => {
                setAntigenicityThreshold(data.threshold);
                console.log("Antigenicity threshold:", data.threshold);
              });

            if (Array.isArray(antigenArray)) {
              setAntigenicityScreening(
                antigenArray.map((item) => ({
                  sequence: item.Sequences,
                  score: item.Prediction_Score,
                  antigen: !!item.Antigen, // ensures boolean
                }))
              );
              // set the associoated sequence's antigenicity in results
              setResults((prevResults) => {
                const updated = prevResults.map((entry) => {
                  const match = antigenArray.find(
                    (item) => item.Sequences === entry.sequence
                  );
                  if (match) {
                    return {
                      ...entry,
                      antigen: !!match.Antigen,
                    };
                  }
                  return entry;
                });
                console.log("Updated results after antigen:", updated);
                return updated;
              });

              setResults((prevResults) => {
                const updated = prevResults.map((entry) => {
                  const match = allergenicityScreening.find(
                    (item) => item.sequence === entry.sequence
                  );
                  if (match) {
                    return {
                      ...entry,
                      allergen: !!match.allergen,
                    };
                  }
                  return entry;
                });
                console.log("Updated results after allergen:", updated);
                return updated;
              });

              setResults((prevResults) => {
              const updated = prevResults.map((entry) => {
                const match = toxicityScreening.find(
                  (item) => item.sequence === entry.sequence
                );
                if (match) {
                  return {
                    ...entry,
                    toxin: match.toxin === true,
                  };
                }
                return entry;
              });
              console.log("Updated results after toxin:", updated);
              return updated;
            });
              // console.log("Updated results: ", results);
            } else {
              console.warn("Vaxijen data is not an array:", data);
              setAntigenicityScreening([]);
            }

            console.log(
              "Antigenicity Screening Results:",
              antigenicityScreening
            );
          } 
          // else if (endpoint.name === "AlgPred2") {
          //   const allergenArray = Array.isArray(data) ? data : data.results;

          //   fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + "get_allergenicity_threshold/", {
          //     headers: {
          //       "Content-Type": "application/json",
          //     }
          //   })
          //     .then((response) => {
          //       if (!response.ok) {
          //         throw new Error("Failed to fetch allergenicity threshold");
          //       }
          //       return response.json();
          //     })
          //     .then((data) => {
          //       setAllergenicityThreshold(data.threshold);
          //       console.log("Allergenicity threshold:", data.threshold);
          //     });

          //   if (Array.isArray(allergenArray)) {
          //     setAllergenicityScreening(
          //       allergenArray.map((item) => ({
          //         sequence: item.sequence,
          //         score: item.score,
          //         allergen: !!item.allergen, // already boolean
          //       }))
          //     );
          //     setResults((prevResults) => {
          //       const updated = prevResults.map((entry) => {
          //         const match = allergenArray.find(
          //           (item) => item.sequence === entry.sequence
          //         );
          //         if (match) {
          //           return {
          //             ...entry,
          //             allergen: !!match.allergen,
          //           };
          //         }
          //         return entry;
          //       });
          //       console.log("Updated results after allergen:", updated);
          //       return updated;
          //     });
          //     // console.log("Updated results: ", results);
          //   } else {
          //     console.warn("AlgPred2 data is not an array:", data);
          //     setAllergenicityScreening([]);
          //   }

          //   console.log(
          //     "Allergenicity Screening Results:",
          //     allergenicityScreening
          //   );
          // } 
          // else if (endpoint.name === "ToxinPred") {
          //   const toxicityArray = Array.isArray(data) ? data : data.results;

          //   if (!Array.isArray(toxicityArray)) {
          //     console.warn("ToxinPred data is not an array:", data);
          //     setToxicityScreening([]);
          //     return;
          //   }

          //   setToxicityScreening(
          //     toxicityArray.map((item) => ({
          //       sequence: item.sequence,
          //       score: item.score,
          //       toxin: item.prediction === "Toxin",
          //     }))
          //   );
          //   setResults((prevResults) => {
          //     const updated = prevResults.map((entry) => {
          //       const match = toxicityArray.find(
          //         (item) => item.sequence === entry.sequence
          //       );
          //       if (match) {
          //         return {
          //           ...entry,
          //           toxin: match.prediction === "Toxin",
          //         };
          //       }
          //       return entry;
          //     });
          //     console.log("Updated results after toxin:", updated);
          //     return updated;
          //   });
          //   console.log("Toxicity Screening Results:", toxicityScreening);
          //   // console.log("Updated results: ", results);
          // }
          return { name: endpoint.name, data };
        })
        .catch((err) => {
          console.error(`${endpoint.name} error:`, err);
          return { name: endpoint.name, error: err.message };
        })
    );

    const allResults = await Promise.all(requests);

    console.log("All screening results:", allResults);
    if (progress >= 100) {
      setProgress(100);
      setCurrentMessage(messages.length - 1);
    }
    return allResults;
  }

  useEffect(() => {
    async function runPipeline() {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_ENDPOINT + "pipeline_name/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pipeline name");
        }
        const data = await response.json();
        setPipelineName(data.pipeline_name);
      } catch (error) {
        console.error("Error fetching pipeline name:", error);
      }

      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_ENDPOINT + "get_steps/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch steps");
        }
        const data = await response.json();
        setSteps(data.steps);
        console.log("Steps from backend:", data.steps);
      } catch (error) {
        console.error("Error fetching steps:", error);
      }

      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_ENDPOINT + "get_selections/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch selections");
        }
        const data = await response.json();
        setSelections(data.selections);
      } catch (error) {
        console.error("Error fetching selections:", error);
      }

      if (predictedPeptides.length > 0) {
        console.log("Peptides already extracted, skipping epitope prediction.");
        setLoading(false);
        return;
      }

      try {
        console.log("Starting epitope prediction...");
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "epitope_prediction/";
        console.log("Endpoint: ", endpoint);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alleles:
              "HLA-A*01:01, HLA-A*02:01, HLA-A*02:03, HLA-A*02:06, HLA-A*03:01, HLA-A*11:01, HLA-A*23:01, HLA-A*24:02, HLA-A*26:01, HLA-A*30:01, HLA-A*30:02, HLA-A*31:01, HLA-A*32:01, HLA-A*33:01, HLA-A*68:01, HLA-A*68:02, HLA-B*07:02, HLA-B*08:01, HLA-B*15:01, HLA-B*35:01, HLA-B*40:01, HLA-B*44:02, HLA-B*44:03, HLA-B*51:01, HLA-B*53:01, HLA-B*57:01, HLA-B*58:01",
            methods: ["netmhcpan_el"],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Epitope prediction result:", data);
          // Extract peptides from the response
          let count = 1;
          for (const item of data) {
            if (item.sequence) {
              // Build the ResultEntry object
              const resultEntry: ResultEntry = {
                sequence: item.sequence,
                binding_score: Math.round(item.weighted_score * 10 * 10) / 10, // Round to 1 decimal place
                allele: item.allele,
                rank: count++,
              };
              predictedPeptides.push(resultEntry);
              console.log("Extracted peptide:", resultEntry);
            }
          }
          // Ensure predicted Peptides is only first 10 entries
          predictedPeptides.splice(10);
          setPredictedPeptides(predictedPeptides);
          if (results.length < 10) {
            let count = 1;
            for (const item of data) {
              if (item.sequence) {
                // Build the ResultEntry object
                const resultEntry: ResultCompleteEntry = {
                  sequence: item.sequence,
                  binding_score: Math.round(item.weighted_score * 10 * 10) / 10, // Round to 1 decimal place
                  allele: item.allele,
                  antigen: false, // Placeholder, will be updated later
                  allergen: false, // Placeholder, will be updated later
                  toxin: false, // Placeholder, will be updated later
                  rank: count++,
                };
                results.push(resultEntry);
                console.log("Extracted result:", resultEntry);
              }
            }
            setResults(results);
            console.log("Peptides extracted:", predictedPeptides);
            console.log("Results updated:", results);
            if (progress + 20 < 100) {
              setProgress((prev) => prev + 20);
              setCurrentMessage((prev) => (prev + 1) % messages.length);
            }
            if (progress >= 100) {
              setProgress(100);
              setCurrentMessage(messages.length - 1);
            }
          }
        } else {
          console.error("Failed to predict epitopes.");
          const errorData = await response.json();
          console.error("Failed to predict epitopes:", errorData.detail);
        }
      } catch (error) {
        console.error("Error during epitope prediction:", error);
      }

      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "conservancy_analysis/";
        console.log("Endpoint: ", endpoint);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            peptides: predictedPeptides.map((p) => p.sequence),
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Conservancy results:", result);
        // Assuming the result is an array of objects with sequence and conservation_score
        const conservancyResults: ConservancyResult[] = result.map(
          (item: ConservancyResult) => ({
            sequence: item.sequence,
            conservation_score: item.conservation_score,
          })
        );
        setConservancyAnalysis(conservancyResults);
        if (progress + 20 < 100) {
          setProgress((prev) => prev + 20);
          setCurrentMessage((prev) => (prev + 1) % messages.length);
        }
        if (progress >= 100) {
          setProgress(100);
          setCurrentMessage(messages.length - 1);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }

      // Cytokine analysis
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "cytokine_analysis/";
        console.log("Endpoint: ", endpoint);
        const response = await fetch(endpoint, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Cytokine Analysis results:", result);
        if (progress + 20 < 100 && cytokineAnalysis === "") {
          setCytokineAnalysis(result.filename);
          setProgress((prev) => prev + 20);
          setCurrentMessage((prev) => (prev + 1) % messages.length);
        }
        if (progress >= 100) {
          setProgress(100);
          setCurrentMessage(messages.length - 1);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }

      // Population coverage analysis
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "population_coverage/";
        console.log("Endpoint: ", endpoint);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            peptides: predictedPeptides.map((p) => p.sequence),
            alleles: predictedPeptides.map((p) => p.allele),
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Population coverage results:", result);
        if (progress + 20 <= 100 && populationCoverage === "0") {
          setPopulationCoverage(result.coverage);
          setProgress((prev) => prev + 20);
          setCurrentMessage((prev) => (prev + 1) % messages.length);
        }
        if (progress >= 100) {
          setProgress(100);
          setCurrentMessage(messages.length - 1);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }

      // Run the antigenicity, allergenicity, and toxicity screenings asynchronously
      console.log(
        "Running antigenicity, allergenicity, and toxicity screenings..."
      );
      try {
        await runScreenings(predictedPeptides);
      } catch (err) {
        console.error("Error during screenings:", err);
      }

      // // Antigenicity Screening
      // try {
      //   const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'antigenicity_screening/';
      //     console.log("Endpoint: ", endpoint);
      //     const response = await fetch(endpoint, {
      //         method: "POST",
      //         headers: {
      //         "Content-Type": "application/json"
      //         },
      //         body: JSON.stringify({ peptides: predictedPeptides.map(p => p.sequence) })
      //     });

      //   if (!response.ok) {
      //     throw new Error("API request failed");
      //   }

      //   const data = await response.json();
      //   console.log("Vaxijen results:", data);
      // } catch (err) {
      //   console.error(err);
      // }

      // // Allergenicity Screening
      // try {
      // const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'allergenicity_screening/';
      //     console.log("Endpoint: ", endpoint);
      //     const response = await fetch(endpoint, {
      //         method: "POST",
      //         headers: {
      //         "Content-Type": "application/json"
      //         },
      //         body: JSON.stringify({ peptides: predictedPeptides.map(p => p.sequence) })
      //     });

      // if (!response.ok) {
      //     throw new Error("API request failed");
      // }

      // const data = await response.json();
      // console.log("AlgPred2 results:", data);
      // } catch (err) {
      // console.error(err);
      // }

      // // Toxicity Screening
      // try {
      // const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'toxicity_screening/';
      //     console.log("Endpoint: ", endpoint);
      //     const response = await fetch(endpoint, {
      //         method: "POST",
      //         headers: {
      //         "Content-Type": "application/json"
      //         },
      //         body: JSON.stringify({ peptides: predictedPeptides.map(p => p.sequence) })
      //     });

      // if (!response.ok) {
      //     throw new Error("API request failed");
      // }

      // const data = await response.json();
      // console.log("ToxinPred results:", data);
      // } catch (err) {
      // console.error(err);
      // }
      setLoading(false);
    }
    runPipeline();
  }, []);

  const antigenicityPieData = useMemo(() => {
    const antigenCount = antigenicityScreening.filter(
      (item) => item.antigen
    ).length;
    return [
      { name: "Antigen", value: antigenCount },
      {
        name: "Non-Antigen",
        value: antigenicityScreening.length - antigenCount,
      },
    ];
  }, [antigenicityScreening]);

  const allergenicityPieData = useMemo(() => {
    const allergenCount = allergenicityScreening.filter(
      (item) => item.allergen
    ).length;
    return [
      { name: "Allergen", value: allergenCount },
      {
        name: "Non-Allergen",
        value: allergenicityScreening.length - allergenCount,
      },
    ];
  }, [allergenicityScreening]);

  const toxicityPieData = useMemo(() => {
    const toxinCount = toxicityScreening.filter((item) => item.toxin).length;
    return [
      { name: "Toxin", value: toxinCount },
      { name: "Non-Toxin", value: toxicityScreening.length - toxinCount },
    ];
  }, [toxicityScreening]);

  function downloadResultsAsCSV(results: ResultCompleteEntry[]) {
    if (!results || results.length === 0) {
      alert("No results available to download yet.");
      return;
    }

    // Define CSV headers
    const headers = [
      "Sequence",
      "Binding Score",
      "HLA Allele",
      "Antigenicity",
      "Allergenicity",
      "Toxicity",
      "Rank",
    ];

    // Map data into CSV rows
    const rows = results.map((r) => [
      r.sequence,
      r.binding_score,
      r.allele,
      r.antigen ? "Antigen" : "Non-Antigen",
      r.allergen ? "Allergen" : "Non-Allergen",
      r.toxin ? "Toxin" : "Non-Toxin",
      r.rank,
    ]);

    // Join headers and rows into CSV text
    const csvContent = [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // get date and time for filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    link.setAttribute("download", `pipeline_results_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Header with animated icon */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full animate-ping"></div>
              <div className="relative bg-indigo-500 dark:bg-indigo-400 p-3 rounded-full">
                <div className="flex items-center justify-center w-12 h-12 text-white text-4xl animate-pulse opacity-100">
                  🚀
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Generating Results for {pipelineName}
            </h1>
          </div>

          {/* Main progress section */}
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-3">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{Math.min(Math.round(progress - 1), 100)}% complete</span>
              </div>
            </div>

            {/* Animated status text */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium animate-shimmer-text">
                  {messages[currentMessage]}
                </p>
              </div>

              {/* Loading dots animation */}
              {/* <div className="flex items-center justify-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      </div>
                    </div> */}
            </div>
          </div>

          {/* Additional animated elements */}
          <div className="flex justify-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Real-Time Processing</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analysing Data</span>
            </div>
          </div>

          {/* Subtle background animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full animate-pulse [animation-delay:1s]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen min-w-screen max-w-screen flex flex-col main-box-1">
      {/* <h1 className="main-heading-1">Hello 👋🏼</h1> */}
      <main className="pr-[55px] mt-[18px] gap-[18px] w-full max-h-3/5 overflow-scroll flex flex-col w-full gap-[16px] normal-box items-center justify-center">
        <div className="flex flex-col h-full">
          <h1 className="main-heading-1">Pipeline Results</h1>
          <div className="flex flex-row w-full justify-between">
            <p className="mb-8 mt-3">
              Generated for <span className="font-semibold">{pipelineName}</span>
            </p>
            <Button variant="default" onClick={() => downloadResultsAsCSV(results)}>
                <h2 className="run-text">Download Results as CSV</h2>
            </Button>    
          </div>
          
          <Tabs defaultValue="summary" className="w-full" width={Math.max(1500, conservancyAnalysis.length * 80)}>
            <TabsList className="w-full h-[80px] flex items-center justify-between bg-muted p-[8px] text-muted-foreground gap-[12px]">
              <TabsTrigger value="summary">
                <div className="flex flex-col items-center gap-[4px] w-full">
                  <RoundIcon imageSrc="/memo.svg"></RoundIcon>
                  <h1>Results Summary</h1>
                </div>
              </TabsTrigger>
              {steps[2] && (
                <TabsTrigger value="step2">
                  <div className="flex flex-col items-center gap-[4px] w-full">
                    <RoundIcon imageSrc="/dna_emoji.svg"></RoundIcon>
                    <h1>T-Cell Epitope Prediction</h1>
                  </div>
                </TabsTrigger>
              )}
              {steps[3] && (
                <TabsTrigger value="step3">
                  <div className="flex flex-col items-center gap-[4px] w-full">
                    <RoundIcon imageSrc="/tree_emoji.svg"></RoundIcon>
                    <h1>Conservancy Analysis</h1>
                  </div>
                </TabsTrigger>
              )}
              {steps[4] && (
                <TabsTrigger value="step4">
                  <div className="flex flex-col items-center gap-[4px] w-full">
                    <RoundIcon imageSrc="/shield_emoji.svg"></RoundIcon>
                    <h1>Antigenicity Screening</h1>
                  </div>
                </TabsTrigger>
              )}
              {steps[5] && (
                <TabsTrigger value="step5">
                  <div className="flex flex-col items-center gap-[4px] w-full">
                    <RoundIcon imageSrc="/pill_emoji.svg"></RoundIcon>
                    <h1>Allergenicity Screening</h1>
                  </div>
                </TabsTrigger>
              )}
              {steps[6] && (
                <TabsTrigger value="step6">
                  <div className="flex flex-col items-center gap-[4px] w-full">
                    <RoundIcon imageSrc="/biohazard_emoji.svg"></RoundIcon>
                    <h1>Toxicity Screening</h1>
                  </div>
                </TabsTrigger>
              )}
              {steps[7] && (
                <TabsTrigger value="step7">
                <div className="flex flex-col items-center gap-[4px] w-full">
                  <RoundIcon imageSrc="/barchart_emoji.svg"></RoundIcon>
                  <h1>Cytokine Analysis</h1>
                </div>
              </TabsTrigger>
              )}
              {steps[8] && (
                <TabsTrigger value="step8">
                  <div className="flex flex-col items-center gap-[4px] w-full">
                    <RoundIcon imageSrc="/globe_emoji.svg"></RoundIcon>
                    <h1>Population Coverage</h1>
                  </div>
              </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="summary">
              <div className="flex flex-col items-center justify-center w-full h-full pt-[24px]">
                <div className="w-full flex flex-row p-[8px] mb-[2px]">
                  <h2 className="text-lg font-semibold mb-4 w-full justify-center flex">
                    Results Summary
                  </h2>
                </div>
                
                <div className="w-full max-w-4xl">
                  <ResultsCompleteTable data={results} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="step2">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">Computed using: <span className="italic">{selections}</span></AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  T-Cell Epitope Prediction Results
                </h2>
                <div className="w-full max-w-4xl">
                  <ResultsTable data={predictedPeptides} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="step3">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">Computed using: <span className="italic">IEDB</span></AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  Conservancy Analysis Results
                </h2>
                <div className="w-full overflow-x-auto">
                  <BarChart
                    width={Math.max(1500, conservancyAnalysis.length * 80)}
                    height={250}
                    data={conservancyAnalysis}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sequence" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="conservation_score" fill="#8b5cf6" />
                  </BarChart>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="step4">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">Computed using: <span className="italic">VaxiJen</span></AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  Antigenicity Screening Results
                </h2>
                <h3 className="text-md">
                  Antigenicity Threshold: <span className="italic">{antigenicityThreshold}</span>
                </h3>
                <PieChart width={400} height={200}>
                  <Pie
                    data={antigenicityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {antigenicityPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
                <div className="w-full max-w-4xl">
                    <AntigenicityTable data={antigenicityScreening} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step5">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">Computed using: <span className="italic">AlgPred2</span></AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  Allergenicity Screening Results
                </h2>
                <h3 className="text-md">
                  Allergenicity Threshold: <span className="italic">{allergenicityThreshold}</span>
                </h3>
                <PieChart width={400} height={400}>
                  <Pie
                    data={allergenicityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allergenicityPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={FLIPCOLORS[index % FLIPCOLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
                <div className="w-full max-w-4xl">
                    <AllergenicityTable data={allergenicityScreening} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step6">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">Computed using: <span className="italic">ToxinPred</span></AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  Toxicity Screening Results
                </h2>
                <PieChart width={400} height={400}>
                  <Pie
                    data={toxicityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {toxicityPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={FLIPCOLORS[index % FLIPCOLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
                <div className="w-full max-w-4xl">
                    <ToxicityTable data={toxicityScreening} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="step7">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">Computed using: <span className="italic">C-Imm-Sim</span></AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  Cytokine Analysis Results
                </h2>
                <Image
                  // src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}static/${cytokineAnalysis}`}
                  src="/cimmsim_result_20250712105217.png"
                  alt="C-ImmSim Result"
                  width={500}
                  height={500}
                />
              </div>
            </TabsContent>
            <TabsContent value="step8">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-full flex justify-start p-[8px] mb-[2px]">
                  <Alert variant="default" className="flex items-center">
                    <Terminal className="h-4 w-4 align-middle" />
                    <AlertTitle className="ml-0">
                      Computed using: <span className="italic">IEDB</span>
                    </AlertTitle>
                  </Alert>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                  Population Coverage Results
                </h2>
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <h3>World Coverage: </h3>
                  <p className="text-2xl font-bold">{populationCoverage}%</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Chat />
      <FeedbackTab />
      <Toaster />
      <footer className="footer_style flex mt-auto w-full"></footer>
    </div>
  );
}
