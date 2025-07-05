"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResultsTable from "@/components/ui/results_table"
import RoundIcon from "@/components/ui/round_icon"
import { Loader2 as Spinner } from 'lucide-react';

const data_pie = [
  { name: 'Antigen', value: 90 },
  { name: 'Non-Antigen', value: 10 },
];

const COLORS = ['#0088FE', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const data = [
  {
    "name": "AAACDEFGH",
    "Conservation (%)": 96,
  },
  {
    "name": "BCDEFGHIJ",
    "Conservation (%)": 87,
  },
  {
    "name": "CDEFGHIJK",
    "Conservation (%)": 43,
  }
]

interface ResultEntry {
  sequence: string;
  binding_score: number;
  rank: number;
}

interface ConservancyResult {
  sequence: string;
  conservation_score: number;
}

export default function ResultsPage() {

    const [loading, setLoading] = useState(true);
    const [predictedPeptides, setPredictedPeptides] = useState<ResultEntry[]>([]);
    const [conservancyAnalysis, setConservancyAnalysis] = useState<ConservancyResult[]>([]);

    useEffect(() => {
        async function runPipeline() {
            if (predictedPeptides.length > 0) {
                console.log("Peptides already extracted, skipping epitope prediction.");
                setLoading(false);
                return;
            }

            try {
                console.log("Starting epitope prediction...");
                const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'epitope_prediction/';
                console.log("Endpoint: ", endpoint);
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        alleles: "HLA-A*02:01,HLA-B*07:02", // Replace with actual alleles
                        methods: ["netmhcpan_el"] // Replace with actual methods
                    })
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
                                rank: count++
                            };
                            predictedPeptides.push(resultEntry);
                            console.log("Extracted peptide:", resultEntry);
                        }
                    }
                    setPredictedPeptides(predictedPeptides);
                    console.log("Peptides extracted:", predictedPeptides);
                } else {
                    console.error("Failed to predict epitopes.");
                    const errorData = await response.json();
                    console.error("Failed to predict epitopes:", errorData.detail);
                }
            } catch (error) {
                console.error("Error during epitope prediction:", error);
            }
            
            try {
                const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'conservancy_analysis/';
                console.log("Endpoint: ", endpoint);
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        peptides: predictedPeptides.map(p => p.sequence),
                    })
                });

                if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
                }

                const result = await response.json();
                console.log("Conservancy results:", result);
                // Assuming the result is an array of objects with sequence and conservation_score
                const conservancyResults: ConservancyResult[] = result.map((item: ConservancyResult) => ({
                    sequence: item.sequence,
                    conservation_score: item.conservation_score
                }));
                setConservancyAnalysis(conservancyResults);
            } catch (err) {
                console.error("API call failed:", err);
            }

            // Assuming the peptides are the output from the previous step
            const peptides = ["YLQPRTFLL", "FIAGLIAIV", "VLNDILSRL", "VLYENQKLI", "RLQSLQTYV", "KIADYNYKL", "RLDKVEAEV", "WTFGAGAAL", "IIRGWIFGT", "FVSNGTHWF"];
            // Antigenicity Screening
            try {
              const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'antigenicity_screening/';
                console.log("Endpoint: ", endpoint);
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ peptides: predictedPeptides.map(p => p.sequence) })
                });

              if (!response.ok) {
                throw new Error("API request failed");
              }

              const data = await response.json();
              console.log("Vaxijen results:", data);
            } catch (err) {
              console.error(err);
            }

            // Allergenicity Screening
            try {
            const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'allergenicity_screening/';
                console.log("Endpoint: ", endpoint);
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ peptides: predictedPeptides.map(p => p.sequence) })
                });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();
            console.log("AlgPred2 results:", data);
            } catch (err) {
            console.error(err);
            }

            // Toxicity Screening
            try {
            const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'toxicity_screening/';
                console.log("Endpoint: ", endpoint);
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ peptides: predictedPeptides.map(p => p.sequence) })
                });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();
            console.log("ToxinPred results:", data);
            } catch (err) {
            console.error(err);
            }
            setLoading(false);

        }
        runPipeline();
    }, []);

    if (loading) {
        return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Spinner />
            <p>Running pipeline... please wait</p>
        </div>
        );
  }

    return (
        <div className="min-h-screen max-h-screen min-w-screen max-w-screen flex flex-col main-box-1">
            {/* <h1 className="main-heading-1">Hello 👋🏼</h1> */}
            <main className="pr-[55px] mt-[18px] gap-[18px] w-full max-h-3/5 overflow-scroll flex flex-col w-full gap-[16px] normal-box items-center justify-center">
            <div className="flex flex-col h-full">
            <h1 className="main-heading-1">Pipeline Results</h1>
            <p className="mb-8">This is the results page where you can view the analysis results.</p>
            <Tabs defaultValue="step2" className="w-full">
                <TabsList className='w-full h-[80px] flex items-center justify-between bg-muted p-[8px] text-muted-foreground gap-[12px]'>
                    <TabsTrigger value="step2">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/dna_emoji.svg"></RoundIcon>
                            <h1>T-Cell Epitope Prediction</h1>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="step3">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/tree_emoji.svg"></RoundIcon>
                            <h1>Conservancy Analysis</h1>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="step4">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/shield_emoji.svg"></RoundIcon>
                            <h1>Antigenicity Screening</h1>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="step5">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/pill_emoji.svg"></RoundIcon>
                            <h1>Allergenicity Screening</h1>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="step6">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/biohazard_emoji.svg"></RoundIcon>
                            <h1>Toxicity Screening</h1>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="step7">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/barchart_emoji.svg"></RoundIcon>
                            <h1>Cytokine Analysis</h1>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="step8">
                        <div className="flex flex-col items-center gap-[4px] w-full">
                            <RoundIcon imageSrc="/globe_emoji.svg"></RoundIcon>
                            <h1>Population Coverage</h1>
                        </div>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="step2">
                    <div className="flex flex-col items-center justify-center w-full h-full pt-[24px]">
                        <h2 className="text-lg font-semibold mb-4">T-cell Epitope Prediction Results</h2>
                        <div className="w-full max-w-4xl">
                            <ResultsTable data={peptides} />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="step3">
                    <div className="flex flex-col items-center justify-center w-full h-full pt-[24px]">
                        <BarChart width={730} height={250} data={conservancyAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sequence" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="conservation_score" fill="#8b5cf6" />
                        </BarChart>
                    </div>
                    
                </TabsContent>
                <TabsContent value="step4">
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <PieChart width={400} height={400}>
                            <Pie
                                data={data_pie}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>
                </TabsContent>
                <TabsContent value="step5">
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <PieChart width={400} height={400}>
                            <Pie
                                data={data_pie}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>
                </TabsContent>
                <TabsContent value="step6">
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <PieChart width={400} height={400}>
                            <Pie
                                data={data_pie}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>
                </TabsContent>
            </Tabs>
            </div>
            </main>
            <footer className="footer_style flex mt-auto w-full">
                
            </footer>
            </div>
    );
                            
}