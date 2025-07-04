"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"



import { useRouter } from "next/navigation"


export default function Pipeline() {
  const [ uploadedFiles, setUploadedFiles ] = useState<File[]>([]);
  const [sequence, setSequence] = useState<string>('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [s2Consensus, setS2Consensus] = useState(false);
  const router = useRouter();

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedFiles((prev: File[]) => [...prev, file]);
      console.log("File uploaded:", file);
    }
  };

  const handleSubmit = async (event: any) => {
    // event.preventDefault();

    // const formData = new FormData();
    // uploadedFiles.forEach(file => {
    //     formData.append('file_uploads', file);
    // });

    // try {
    //     const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'uploadfile/';
    //     console.log("Endpoint: ", endpoint);
    //     const response = await fetch(endpoint, {
    //         method: "POST",
    //         headers: {
    //             'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
    //         },
    //         body: formData
    //     });

    //     if (response.ok) {
    //         // Clear files and redirect on success
    //         setUploadedFiles([]);

    //     //   router.push('../projects');
    //     } else {
    //         console.error("Failed to upload files.");
    //         const errorData = await response.json();
    //         console.error("Failed to upload files:", errorData.detail);
    //         alert("Error: " + errorData.detail);

    //     //   router.push('/upload_files/');
    //     }
    // } catch (error) {
    //     console.error(error);
    // }

    // console.log("Sequence:", sequence);

    // try {
    //     console.log("Starting epitope prediction...");
    //     const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'epitope_prediction/';
    //     console.log("Endpoint: ", endpoint);
    //     const response = await fetch(endpoint, {
    //         method: "POST",
    //         headers: {
    //             'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             sequence: sequence, // Replace with actual sequence
    //             alleles: "HLA-A*02:01,HLA-B*07:02", // Replace with actual alleles
    //             methods: ["netmhcpan_el"] // Replace with actual methods
    //         })
    //     });

    //     if (response.ok) {
    //         const data = await response.json();
    //         console.log("Epitope prediction result:", data);
    //     } else {
    //         console.error("Failed to predict epitopes.");
    //         const errorData = await response.json();
    //         console.error("Failed to predict epitopes:", errorData.detail);
    //     }
    // } catch (error) {
    //     console.error("Error during epitope prediction:", error);
    // }
    
    // try {
    //     const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'conservancy_analysis/';
    //     console.log("Endpoint: ", endpoint);
    //     const response = await fetch(endpoint, {
    //         method: "POST",
    //         headers: {
    //             'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             // Peptides need to be the output from first request
    //             // For now, we will use the sequence as a placeholder
    //             peptides: ["YLQPRTFLL", "FIAGLIAIV", "VLNDILSRL", "VLYENQKLI", "RLQSLQTYV", "KIADYNYKL", "RLDKVEAEV", "WTFGAGAAL", "IIRGWIFGT", "FVSNGTHWF"],
    //             protein_sequence: sequence // Replace with actual protein sequence
    //         })
    //     });

    //     if (!response.ok) {
    //     throw new Error(`Error: ${response.status}`);
    //     }

    //     const result = await response.json();
    //     console.log("Conservancy results:", result);
    // } catch (err) {
    //     console.error("API call failed:", err);
    // }

    // Assuming the peptides are the output from the previous step
    const peptides = ["YLQPRTFLL", "FIAGLIAIV", "VLNDILSRL", "VLYENQKLI", "RLQSLQTYV", "KIADYNYKL", "RLDKVEAEV", "WTFGAGAAL", "IIRGWIFGT", "FVSNGTHWF"];
    // Antigenicity Screening
    // try {
    //   const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'antigenicity_screening/';
    //     console.log("Endpoint: ", endpoint);
    //     const response = await fetch(endpoint, {
    //         method: "POST",
    //         headers: {
    //         "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({ peptides })
    //     });

    //   if (!response.ok) {
    //     throw new Error("API request failed");
    //   }

    //   const data = await response.json();
    //   console.log("Vaxijen results:", data);
    // } catch (err) {
    //   console.error(err);
    // }

    // Allergenicity Screening
    try {
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'allergenicity_screening/';
        console.log("Endpoint: ", endpoint);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ peptides })
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
            body: JSON.stringify({ peptides })
        });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("ToxinPred results:", data);
    } catch (err) {
      console.error(err);
    }

  };

  return (
    <div className="min-h-screen max-h-screen min-w-screen max-w-screen flex flex-col main-box-1">
        <h1 className="main-heading-1">Hello 👋🏼</h1>
        <main className="pr-[55px] mt-[18px] gap-[18px] w-full max-h-3/5 overflow-scroll flex flex-col w-full gap-[16px]">
            <div className="flex flex-col normal-box">
                <div className="flex flex-row w-full items-center gap-[8px]">
                    <Image src="/pipeline.svg" alt="Pipeline Icon" width={16} height={16}></Image>
                    <h1>Pipeline Configuration</h1>
                </div>
                
                <div className="flex flex-row w-full items-center justify-between">
                    <div className="flex flex-col gap-[6px] w-full">
                        <h2 className="pl-[2px] input-box-header">Pipeline Name</h2>
                        <Input className="input-text w-1/2" placeholder="Enter pipeline name..."></Input>
                    </div>
                </div>
                <div className="line-seperator-box">
                    <div className="line-seperator"></div>
                </div>
                <div className="flex flex-row items-center gap-[12px]">
                    <Switch checked={advancedMode} onCheckedChange={setAdvancedMode}></Switch>
                    <Image src="/lightning.svg" alt="Lightning Icon" width={14} height={14}></Image>
                    <h3 className="input-box-header">Advanced Mode</h3>
                    {advancedMode && <Badge variant="red">Enabled</Badge>}
                </div>
            </div>
            <h1>Pipeline Workflow</h1>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 1</Badge>
                                <h1>Upload Sequence</h1>
                                <Badge variant="required_badge">Required</Badge>
                            </div>

                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Upload sequence file or paste sequence</h1>
                            <div className="flex flex-col gap-[4px] w-full h-[100px]">
                                <FileUpload setFile={handleFileUpload} />
                            </div>
                            <div className="flex flex-col w-full justify-center items-center justify-between">
                                <h2 className="description-text">or</h2>
                            </div>
                            <h1 className="input-box-header">Paste Sequence</h1>
                            <div className="flex flex-col gap-[4px] w-full">
                                <Textarea className="input-text w-full min-h-[100px] items-start text-start align-top" placeholder="Paste your sequence here..." onChange={e => setSequence(e.target.value)}></Textarea>
                            </div>
                        </div>
                    </AccordionContent>
                    </div>
                    
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 2</Badge>
                            <h1>T-Cell Epitope Prediction</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Predict T-Cell epitopes from the uploaded sequence</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                    
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 3</Badge>
                            <h1>Epitope Conservancy Analysis</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Analyse epitope conservation across variants</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                    
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 4</Badge>
                            <h1>Antigenicity Screening</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Screen for antigenic potential</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                    
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 5</Badge>
                            <h1>Allergenicity Screening</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Check for allergen potential</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 6</Badge>
                            <h1>Toxicity Screening</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Assess toxicity potential</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 7</Badge>
                            <h1>Cytokine Analysis</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Predict cytokine induction profile</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <div className="accordion-wrapper">
                    <AccordionTrigger className="first-box-accordion">
                        <div className="flex flex-row w-full items-center gap-[12px]">
                            <Badge variant="step_badge">Step 8</Badge>
                            <h1>Population Coverage Analysis</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <h1 className="description-text">Calculate population coverage</h1>
                            <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                                <div className="flex flex-col gap-[8px] w-full">
                                    <h1 className="parameter-heading">Consensus Mode</h1>
                                    <h2 className="parameter-description">Use all available methods for consensus prediction</h2>
                                </div>
                                <Switch checked={s2Consensus} onCheckedChange={setS2Consensus}></Switch>
                            </div>

                            <h1 className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden`}>Select Methods</h1>
                            <div className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${s2Consensus ? "opacity-0 max-h-0 pointer-events-none" : "opacity-100 max-h-40"}
                                    overflow-hidden
                                `}>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/netmhcpan.svg" alt="NetMHCpan Icon" width={16} height={16}></Image> */}
                                    NetMHCpan
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/mhcflurry.svg" alt="MHCflurry Icon" width={16} height={16}></Image> */}
                                    IEDB
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    DeepMHC
                                </Toggle>
                                <Toggle className="toggle-button" variant="outline">
                                    {/* <Image src="/iedb.svg" alt="IEDB Icon" width={16} height={16}></Image> */}
                                    MHCflurry
                                </Toggle>
                            </div>
                            {advancedMode && (
                            <div className="flex w-full flex-col gap-[6px]">
                                <div className="line-seperator-box">
                                <div className="line-seperator"></div>
                                </div>
                                <div className="flex flex-row items-center gap-[12px]">
                                <h1 className="input-box-header">Advanced Parameters</h1>
                                <Badge variant="red">Advanced</Badge>
                                </div>
                                <div>
                                <h2 className="parameter-heading">HLA Alleles</h2>
                                </div>
                            </div>
                            )}
                        </div>
                        
                    </AccordionContent>
                    </div>
                </AccordionItem>
            </Accordion>
            <div className="flex justify-center mt-[8px] mb-[36px]">
                <Button className="run-button" onClick={handleSubmit}>
                    <Image src="/play.svg" alt="Run Pipeline" width={16} height={16} priority />
                    <h2 className="run-text">Run Analysis</h2>
                </Button>                
            </div>
            
        </main>
        <footer className="footer_style flex mt-auto w-full">
            
        </footer>
    </div>
  );
}
 