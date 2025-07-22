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
import RoundIcon from "@/components/ui/round_icon"


import { useRouter } from "next/navigation"
import { Chat } from "@/components/ui/chat";


export default function Pipeline() {
    const [ uploadedFiles, setUploadedFiles ] = useState<File[]>([]);
    const [ uploadedConservancyFiles, setUploadedConservancyFiles ] = useState<File[]>([]);
    const [sequence, setSequence] = useState<string>('');
    const [conservancySequence, setConservancySequence] = useState<string>('');
    const [advancedMode, setAdvancedMode] = useState(false);
    const [s2Consensus, setS2Consensus] = useState(false);
    const [error, setError] = useState(false);
    const [conservancyError, setConservancyError] = useState(false);
    const router = useRouter();
    const [fileUpload, setFileUpload] = useState(false);
    const [conservancyFileUpload, setConservancyFileUpload] = useState(false);
    // const [selectedAlleles, setSelectedAlleles] = useState<string[]>([]);

    // 2. Handler to toggle selection
    // const handleToggle = (allele: string) => {
    //     console.log("Selected Alleles:", selectedAlleles);
    //     setSelectedAlleles(prev => {
    //     if (prev.includes(allele)) {
    //         // Deselect
    //         if (prev.length === 1) {
    //             setPopCovError(true); // Set error if last allele is deselected
    //         }
    //         return prev.filter(a => a !== allele);
    //     } else {
    //         // Select
    //         setPopCovError(false); // Reset error state when an allele is selected
    //         return [...prev, allele];
    //     }
    //     });
    // };

    // // 3. Create final list with "HLA-" prefix
    // const finalSelections = selectedAlleles.map(allele => `HLA-${allele}`);
    // console.log('Selections to send:', finalSelections);

    // // 5. Example list of alleles for each gene
    // const hlaA = [
    //     'A*01:01', 'A*02:01', 'A*02:06', 'A*03:01', 'A*11:01', 'A*23:01', 'A*24:02',
    //     'A*25:01', 'A*26:01', 'A*29:02', 'A*30:01', 'A*31:01', 'A*32:01', 'A*33:01',
    //     'A*34:01', 'A*66:01', 'A*68:01', 'A*69:01', 'A*74:01'
    // ];

    // const hlaB = [
    //     'B*07:02', 'B*08:01', 'B*13:02', 'B*15:01', 'B*18:01', 'B*27:05', 'B*35:01',
    //     'B*37:01', 'B*38:01', 'B*39:01', 'B*40:01', 'B*44:02', 'B*44:03', 'B*51:01',
    //     'B*52:01', 'B*53:01', 'B*57:01', 'B*58:01', 'B*73:01'
    // ];

    // const hlaC = [
    //     'C*01:02', 'C*02:02', 'C*03:03', 'C*04:01', 'C*05:01', 'C*06:02',
    //     'C*07:01', 'C*07:02', 'C*08:01', 'C*12:03', 'C*14:02', 'C*15:02'
    // ];

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedFiles((prev: File[]) => [...prev, file]);
      console.log("File uploaded:", file);
    }

    setError(false); // Reset error state when a file is uploaded
    setFileUpload(true);
  };

  const handleConservancyFileUpload = (file: File | null) => {
    if (file) {
      setUploadedConservancyFiles((prev: File[]) => [...prev, file]);
      console.log("File uploaded:", file);
    }

    setError(false); // Reset error state when a file is uploaded
    setConservancyFileUpload(true);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (uploadedFiles.length === 0 && sequence.trim() === '') {
        setError(true);
        alert("Please upload a file or paste a sequence.");
        return;
    }

    if (uploadedConservancyFiles.length === 0 && conservancySequence.trim() === '') {
        setConservancyError(true);
        alert("Please upload a file or paste a sequence for conservancy analysis.");
        return;
    }

    //  if (selectedAlleles.length === 0) {
    //     setPopCovError(true);
    //     alert("Please select at least one HLA allele.");
    //     return;
    // }

    // // Upload allele selections
    // if (selectedAlleles.length > 0) {
    //     try {
    //         const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'upload_alleles/';
    //         console.log("Endpoint: ", endpoint);
    //         const response = await fetch(endpoint, {
    //             method: "POST",
    //             headers: {
    //                 'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ alleles: finalSelections })
    //         });

    //         if (response.ok) {
    //             console.log("Alleles uploaded successfully.");
    //         } else {
    //             console.error("Failed to upload alleles.");
    //             const errorData = await response.json();
    //             console.error("Failed to upload alleles:", errorData.detail);
    //             alert("Error: " + errorData.detail);
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // Upload conservancy analysis files or sequence
    if (uploadedConservancyFiles.length !== 0) {
        const formData = new FormData();
        uploadedConservancyFiles.forEach(file => {
            formData.append('file_uploads', file);
        });

        try {
            const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'upload_conservancy_file/';
            console.log("Endpoint: ", endpoint);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                },
                body: formData
            });

            if (response.ok) {
                // Clear files and redirect on success
                setUploadedConservancyFiles([]); 

            //   router.push('../projects');
            } else {
                console.error("Failed to upload files.");
                const errorData = await response.json();
                console.error("Failed to upload files:", errorData.detail);
                alert("Error: " + errorData.detail);

            //   router.push('/upload_files/');
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        // Check seqeunce is valid fasta format
        const fastaRegex = /^>.*\n([ACDEFGHIKLMNPQRSTVWY\n]+)$/i;
        if (!fastaRegex.test(sequence)) {
            setConservancyError(true);
            alert("Invalid sequence format for conservancy analysis. Please ensure it is in FASTA format.");
            return;
        }
        setConservancyError(false);
        // If sequence is valid, send to backend
        console.log("Conservancy Sequence:", conservancySequence);
        console.log("Stringified Conservancy Sequence:", JSON.stringify({ conservancySequence }));
        try {
            const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'upload_conservancy_sequence/';
            console.log("Endpoint: ", endpoint);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conservancySequence })
            });

            if (response.ok) {
                // Clear sequence and redirect on success
                setConservancySequence('');
            } else {
                console.error("Failed to upload sequence.");
                const errorData = await response.json();
                console.error("Failed to upload sequence:", errorData.detail);
                alert("Error: " + errorData.detail);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (uploadedFiles.length !== 0) {
        const formData = new FormData();
        uploadedFiles.forEach(file => {
            formData.append('file_uploads', file);
        });

        try {
            const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'upload_file/';
            console.log("Endpoint: ", endpoint);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                },
                body: formData
            });

            if (response.ok) {
                // Clear files and redirect on success
                setUploadedFiles([]); 
                router.push('../results');

            //   router.push('../projects');
            } else {
                console.error("Failed to upload files.");
                const errorData = await response.json();
                console.error("Failed to upload files:", errorData.detail);
                alert("Error: " + errorData.detail);

            //   router.push('/upload_files/');
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        // Check seqeunce is valid fasta format
        const fastaRegex = /^>.*\n([ACDEFGHIKLMNPQRSTVWY\n]+)$/i;
        if (!fastaRegex.test(sequence)) {
            setError(true);
            alert("Invalid sequence format. Please ensure it is in FASTA format.");
            return;
        }
        setError(false);
        // If sequence is valid, send to backend
        try {
            const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'upload_sequence/';
            console.log("Endpoint: ", endpoint);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sequence })
            });

            if (response.ok) {
                // Clear sequence and redirect on success
                setSequence('');
                router.push('../results');
            } else {
                console.error("Failed to upload sequence.");
                const errorData = await response.json();
                console.error("Failed to upload sequence:", errorData.detail);
                alert("Error: " + errorData.detail);

            //   router.push('/upload_sequence/');
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    console.log("Sequence:", sequence);

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
                        <RoundIcon imageSrc="/file_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 1</Badge>
                                <h1 className={error ? "text-red-600" : ""}>Upload Sequence</h1>
                                <Badge variant="required_badge">Required</Badge>
                                {error && (
                                    <Image src="/exclamation_emoji.svg" alt="Error Icon" width={16} height={16} className="flashing-error" />
                                )}
                            </div>
                            <h1 className={error ? "description-text-error" : "description-text"}>Upload sequence file or paste sequence</h1>
                            
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <div className="flex flex-col gap-[4px] w-full h-[100px]">
                                <FileUpload setFile={handleFileUpload} />
                            </div>
                            <div className="flex flex-col w-full justify-center items-center justify-between">
                                <h2 className="description-text">or</h2>
                            </div>
                            <h1 className="input-box-header">Paste Sequence</h1>
                            <div className="flex flex-col gap-[4px] w-full">
                                <Textarea
                                    className="input-text w-full min-h-[100px] items-start text-start align-top"
                                    placeholder="Paste your sequence here..."
                                    disabled={fileUpload}
                                    onChange={e => {
                                        setSequence(e.target.value);
                                        setError(false);
                                    }}
                                ></Textarea>
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
                        <RoundIcon imageSrc="/dna_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 2</Badge>
                                <h1>T-Cell Epitope Prediction</h1>
                            </div>
                            <h1 className="description-text">Predict T-Cell epitopes from the uploaded sequence</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
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
                        <RoundIcon imageSrc="/tree_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 3</Badge>
                                <h1 className={conservancyError ? "text-red-600" : ""}>Epitope Conservancy Analysis</h1>
                                <Badge variant="required_badge">Required</Badge>
                                {conservancyError && (
                                    <Image src="/exclamation_emoji.svg" alt="Error Icon" width={16} height={16} className="flashing-error" />
                                )}
                            </div>
                            <h1 className={conservancyError ? "description-text-error" : "description-text"}>Analyse epitope conservation across variants</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <div className="flex flex-col gap-[0px] first-box">
                            <div className="flex flex-col gap-[4px] w-full h-[100px]">
                                <FileUpload setFile={handleConservancyFileUpload} />
                            </div>
                            <div className="flex flex-col w-full justify-center items-center justify-between">
                                <h2 className="description-text">or</h2>
                            </div>
                            <h1 className="input-box-header">Paste Sequence(s)</h1>
                            <div className="flex flex-col gap-[4px] w-full">
                                <Textarea
                                    className="input-text w-full min-h-[100px] items-start text-start align-top"
                                    placeholder="Paste your sequence(s) here..."
                                    disabled={conservancyFileUpload}
                                    onChange={e => {
                                        setConservancySequence(e.target.value);
                                        setConservancyError(false);
                                    }}
                                ></Textarea>
                            </div>
                        </div>
                        <div className="line-seperator-box">
                            <div className="line-seperator"></div>
                        </div>
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
                        <RoundIcon imageSrc="/shield_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 4</Badge>
                                <h1>Antigenicity Screening</h1>
                            </div>
                            <h1 className="description-text">Screen for antigenic potential</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
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
                        <RoundIcon imageSrc="/pill_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 5</Badge>
                                <h1>Allergenicity Screening</h1>
                            </div>
                            <h1 className="description-text">Screen for allergenic potential</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
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
                        <RoundIcon imageSrc="/biohazard_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 6</Badge>
                                <h1>Toxicity Screening</h1>
                            </div>
                            <h1 className="description-text">Assess toxicity potential</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
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
                        <RoundIcon imageSrc="/barchart_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 7</Badge>
                                <h1>Cytokine Analysis</h1>
                            </div>
                            <h1 className="description-text">Predict cytokine induction profile</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
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
                        <RoundIcon imageSrc="/globe_emoji.svg"></RoundIcon>
                        <div className="flex flex-col gap-[8px] w-full">
                            <div className="flex flex-row items-center gap-[12px] w-full">
                                <Badge variant="step_badge">Step 8</Badge>
                                <h1>Population Coverage Analysis</h1>
                            </div>
                            <h1 className="description-text">Calculate population coverage</h1>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-[0px] first-box">
                            <div>
                                <h2 className="larger-parameter-heading">HLA Alleles</h2>
                                {/* <div className="flex flex-col mt-[12px] gap-[8px]">
                                    <h1 className="parameter-heading">HLA-A</h1>
                                    <div className="flex flex-row flex-wrap gap-[6px] p-[4px]">
                                        {hlaA.map(allele => (
                                            <Toggle
                                                className="smaller-toggle-button"
                                                key={allele}
                                                pressed={selectedAlleles.includes(allele)}
                                                onClick={() => handleToggle(allele)}
                                            >
                                                {allele}
                                            </Toggle>
                                        ))}
                                    </div>
                                    <h1 className="parameter-heading">HLA-B</h1>
                                    <div className="flex flex-row flex-wrap gap-[6px] p-[4px]">
                                        {hlaB.map(allele => (
                                            <Toggle
                                                className="smaller-toggle-button"
                                                key={allele}
                                                pressed={selectedAlleles.includes(allele)}
                                                onClick={() => handleToggle(allele)}
                                            >
                                                {allele}
                                            </Toggle>
                                        ))}
                                    </div>
                                    
                                    <h1 className="parameter-heading">HLA-C</h1>
                                    <div className="flex flex-row flex-wrap gap-[6px] p-[4px]">
                                        {hlaC.map(allele => (
                                            <Toggle
                                                className="smaller-toggle-button"
                                                key={allele}
                                                pressed={selectedAlleles.includes(allele)}
                                                onClick={() => handleToggle(allele)}
                                            >
                                                {allele}
                                            </Toggle>
                                        ))}
                                    </div>
                                </div> */}
                                </div>
                                <div className="line-seperator-box">
                                    <div className="line-seperator"></div>
                                </div>
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
            <Chat />
        </footer>
    </div>
  );
}
 