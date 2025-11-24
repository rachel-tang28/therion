"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RoundIcon from "@/components/ui/round_icon";

import { useRouter } from "next/navigation";
import { Chat } from "@/components/ui/chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BotMessageSquare, Check, CheckSquare2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Pipeline() {
  const [pipelineName, setPipelineName] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedConservancyFiles, setUploadedConservancyFiles] = useState<
    File[]
  >([]);
  const [sequence, setSequence] = useState<string>("");
  const [conservancySequence, setConservancySequence] = useState<string>("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [s2Consensus, setS2Consensus] = useState(false);
  const [error, setError] = useState(false);
  const [conservancyError, setConservancyError] = useState(false);
  const router = useRouter();
  const [fileUpload, setFileUpload] = useState(false);
  const [conservancyFileUpload, setConservancyFileUpload] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [threshold, setThreshold] = useState<number>(0.4); // Default threshold value
  const [allergenicityThreshold, setAllergenicityThreshold] = useState<number>(0.3); // Default allergenicity threshold value
  const [selections, setSelections] = useState<string[]>([]);
  const [comparisonOperator, setComparisonOperator] = useState<string>("less");
  const [identityThreshold, setIdentityThreshold] = useState<string>("100%");

  const [activeSteps, setActiveSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
  });
  // accordion open/collapse states
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);
  const [isOpen5, setIsOpen5] = useState(false);
  const [isOpen6, setIsOpen6] = useState(false);
  const [isOpen7, setIsOpen7] = useState(false);
  const [isOpen8, setIsOpen8] = useState(false);

  const toggleStep = (step: number) => {
    setActiveSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  useEffect(() => {
    setShowDialog(true);
  }, []);

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedFiles((prev: File[]) => [...prev, file]);
    }

    setError(false); // Reset error state when a file is uploaded
    setFileUpload(true);
  };

  const handleConservancyFileUpload = (file: File | null) => {
    if (file) {
      setUploadedConservancyFiles((prev: File[]) => [...prev, file]);
    }

    setError(false); // Reset error state when a file is uploaded
    setConservancyFileUpload(true);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    try {
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + "upload_steps/";
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
          "Content-Type": "application/json", // <-- Add this
        },
        body: JSON.stringify({
          activeSteps: activeSteps,
        }),
      });
    } catch (error) {
      console.error(error);
    }

    if (activeSteps[1]) {
      if (uploadedFiles.length === 0 && sequence.trim() === "") {
        setError(true);
        alert("Please upload a file or paste a sequence.");
        return;
      }
    }

    if (activeSteps[3]) {
      if (
        uploadedConservancyFiles.length === 0 &&
        conservancySequence.trim() === ""
      ) {
        setConservancyError(true);
        alert(
          "Please upload a file or paste a sequence for conservancy analysis."
        );
        return;
      }
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT +
          "upload_conservancy_parameters/";
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comparisonOperator: comparisonOperator,
            identityThreshold: identityThreshold,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (activeSteps[4]) {
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "upload_threshold/";
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threshold: threshold,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (activeSteps[5]) {
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT +
          "upload_allergenicity_threshold/";
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threshold: allergenicityThreshold,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (activeSteps[2]) {
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "upload_selections/";
        if (selections.length === 0) {
          setSelections(["netmhcpan_el", "netctl"]); // Default selections if none provided
        }
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selections: selections,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    // Upload conservancy analysis files or sequence
    if (activeSteps[3]) {
      if (uploadedConservancyFiles.length !== 0) {
        const formData = new FormData();
        uploadedConservancyFiles.forEach((file) => {
          formData.append("file_uploads", file);
        });
        // Upload pipeline name
        try {
          const endpoint =
            process.env.NEXT_PUBLIC_API_ENDPOINT + "pipeline_name/";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: pipelineName,
            }),
          });

          if (response.ok) {
            // Clear files and redirect on success
            setUploadedConservancyFiles([]);
          } else {
            console.error("Failed to upload files.");
            const errorData = await response.json();
            console.error("Failed to upload files:", errorData.detail);
            alert("Error: " + errorData.detail);
          }
        } catch (error) {
          console.error(error);
        }

        try {
          const endpoint =
            process.env.NEXT_PUBLIC_API_ENDPOINT + "upload_conservancy_file/";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            },
            body: formData,
          });

          if (response.ok) {
            // Clear files and redirect on success
            setUploadedConservancyFiles([]);
          } else {
            console.error("Failed to upload files.");
            const errorData = await response.json();
            console.error("Failed to upload files:", errorData.detail);
            alert("Error: " + errorData.detail);
            setConservancyError(true);
            setUploadedConservancyFiles([]);
            return;
          }
        } catch (error) {
          console.error(error);
          setConservancyError(true);
          setUploadedConservancyFiles([]);
          return;
        }
      } else {
        // Check seqeunce is valid fasta format
        const fastaRegex = /^>.*\n([ACDEFGHIKLMNPQRSTVWY\n]+)$/i;
        if (!fastaRegex.test(sequence)) {
          setConservancyError(true);
          alert(
            "Invalid sequence format for conservancy analysis. Please ensure it is in FASTA format."
          );
          return;
        }
        setConservancyError(false);
        // If sequence is valid, send to backend
        try {
          const endpoint =
            process.env.NEXT_PUBLIC_API_ENDPOINT +
            "upload_conservancy_sequence/";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ conservancySequence }),
          });

          if (response.ok) {
            // Clear sequence and redirect on success
            setConservancySequence("");
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
    }

    if (uploadedFiles.length !== 0) {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("file_uploads", file);
      });

      try {
        const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + "upload_file/";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: formData,
        });

        if (response.ok) {
          // Clear files and redirect on success
          setUploadedFiles([]);
          router.push("/results");
        } else {
          console.error("Failed to upload files.");
          const errorData = await response.json();
          console.error("Failed to upload files:", errorData.detail);
          alert("Error: " + errorData.detail);
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
        const endpoint =
          process.env.NEXT_PUBLIC_API_ENDPOINT + "upload_sequence/";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sequence }),
        });

        if (response.ok) {
          // Clear sequence and redirect on success
          setSequence("");
          router.push("/results");
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
  };

  return (
    <div className="min-h-screen max-h-screen min-w-screen max-w-screen flex flex-col main-box-1">
      <h1 className="main-heading-1">Hello 👋🏼</h1>
      <main className="pr-[55px] mt-[18px] gap-[18px] w-full max-h-3/5 overflow-scroll flex flex-col w-full gap-[16px]">
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Welcome to Therion</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="text-sm">
                  Start by uploading your sequence or pasting it directly.
                  Follow the step-by-step accordion panels to complete your
                  configuration. <br />
                  <br />
                  Steps marked as &quot;
                  <span className="font-bold text-red-700">Required</span>&quot;
                  must be completed before running the pipeline. All other steps
                  have consensus mode enabled by default, which uses all
                  available methods for prediction. <br />
                  <br />
                  You can also use the{" "}
                  <span className="font-bold text-blue-900 inline-flex align-center items-center gap-1 pl-[4px] pr-[4px]">
                    <BotMessageSquare className="w-4 h-4" />
                    AI Chat
                  </span>{" "}
                  on the bottom right-hand corner for further assistance.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowDialog(false)}>
                Got it!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex flex-col normal-box sticky top-0 bg-white z-10 shadow-md p-[12px] gap-[12px]">
          <div className="flex flex-row w-full items-center gap-[8px]">
            <Image
              src="/pipeline.svg"
              alt="Pipeline Icon"
              width={16}
              height={16}
            ></Image>
            <h1>Pipeline Configuration</h1>
          </div>

          <div className="flex flex-row w-full items-center justify-between">
            <div className="flex flex-col gap-[6px] w-full">
              <h2 className="pl-[2px] input-box-header">Pipeline Name</h2>
              <div className="flex flex-row w-full items-center gap-[8px]">
                <Input
                  className={`input-text max-w-[500px] ${
                    pipelineName
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }`}
                  placeholder="Enter pipeline name..."
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                />
                <span className="inline-block w-5 h-5">
                  <CheckSquare2
                    className={`w-5 h-5 text-green-600 transform transition-opacity transition-transform duration-300 ease-out ${
                      pipelineName
                        ? "opacity-80 translate-y-0"
                        : "opacity-0 -translate-y-1"
                    }`}
                    aria-hidden={!pipelineName}
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="line-seperator-box">
            <div className="line-seperator"></div>
          </div>

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-row items-center gap-[12px]">
                  <Switch
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                  ></Switch>
                  <Image
                    src="/lightning.svg"
                    alt="Lightning Icon"
                    width={14}
                    height={14}
                  ></Image>
                  <h3 className="input-box-header">Advanced Mode</h3>
                  {advancedMode && <Badge variant="red">Enabled</Badge>}
                </div>
              </TooltipTrigger>

              <TooltipContent side="top">
                <p>
                  {advancedMode
                    ? "Advanced mode is enabled. Additional configuration options are now available in each pipeline step."
                    : "Toggle advanced mode to unlock additional configuration options in each pipeline step."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-row justify-between">
          <h1>Pipeline Workflow</h1>

          <TooltipProvider>
            <RadioGroup
              defaultValue="select-all"
              className="flex flex-row items-center space-x-4 pr-[8px]"
            >
              <div className="flex items-center space-x-2">
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <RadioGroupItem
                        value="select-all"
                        id="select-all"
                        onClick={() => {
                          setActiveSteps({
                            1: true,
                            2: true,
                            3: true,
                            4: true,
                            5: true,
                            6: true,
                            7: true,
                            8: true,
                          });
                        }}
                      />
                      <Label htmlFor="select-all">Select All</Label>
                    </div>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>
                      Activate all steps; To deselect individual steps, click
                      the blue check mark on each step icon.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </RadioGroup>
          </TooltipProvider>
        </div>

        <Accordion
          type="single"
          value={isOpen1 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[1] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  // Only allow user to toggle accordion if step is active
                  if (!activeSteps[1]) {
                    e.preventDefault();
                  } else {
                    setIsOpen1((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-block">
                        <RoundIcon imageSrc="/file_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer border-[2px] check-toggle
                        ${
                          activeSteps[1]
                            ? "bg-blue-600 border-gray-400 text-white"
                            : "bg-white border-gray-400 text-transparent"
                        }`}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent accordion toggle
                            setError(true);
                            // Automatically collapse accordion if step becomes inactive
                            if (activeSteps[1]) {
                              setIsOpen1(false);
                            } else {
                              setIsOpen1(true);
                            }
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>Step 1 cannot be deselected for this pipeline.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 1</Badge>
                    <h1 className={error ? "text-red-600" : ""}>
                      Upload Sequence
                    </h1>
                    <Badge variant="required_badge">Required</Badge>
                    {error && (
                      <Image
                        src="/exclamation_emoji.svg"
                        alt="Error Icon"
                        width={16}
                        height={16}
                        className="flashing-error"
                      />
                    )}
                  </div>
                  <h1
                    className={
                      error ? "description-text-error" : "description-text"
                    }
                  >
                    Upload sequence file or paste sequence
                  </h1>
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
                      onChange={(e) => {
                        setSequence(e.target.value);
                        setError(false);
                      }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen2 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[2] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[2]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen2((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-block">
                        <RoundIcon imageSrc="/dna_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer border-[2px] border-gray-400 check-toggle
                                ${
                                  activeSteps[2]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConservancyError(true);
                            if (activeSteps[2]) {
                              setIsOpen2(true);
                            } else {
                              setIsOpen2(true);
                            }
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>Step 2 cannot be deselected for this pipeline.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 2</Badge>
                    <h1>T-Cell Epitope Prediction</h1>
                    <Badge variant="required_badge">Required</Badge>
                  </div>
                  <h1 className="description-text">
                    Predict T-Cell epitopes from the uploaded sequence
                  </h1>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-[0px] first-box">
                  <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h1 className="parameter-heading">Consensus Mode</h1>
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>
                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle
                      className="toggle-button"
                      variant="outline"
                      onClick={() => {
                        setSelections((prev) =>
                          prev.includes("netmhcpan_el")
                            ? prev.filter((s) => s !== "netmhcpan_el")
                            : [...prev, "netmhcpan_el"]
                        );
                      }}
                    >
                      NetMHCpan_el
                    </Toggle>
                    <Toggle
                      className="toggle-button"
                      variant="outline"
                      onClick={() => {
                        setSelections((prev) =>
                          prev.includes("netctl")
                            ? prev.filter((s) => s !== "netctl")
                            : [...prev, "netctl"]
                        );
                      }}
                    >
                      NetCTL
                    </Toggle>
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen3 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[3] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[3]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen3((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Tooltip triggers when hovering anywhere on this block */}
                      <div
                        className="relative inline-block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(3);
                          if (activeSteps[3]) {
                            setIsOpen3(false);
                          } else {
                            setIsOpen3(true);
                          }
                        }}
                      >
                        <RoundIcon imageSrc="/tree_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-gray-400 check-toggle transition-colors
                                ${
                                  activeSteps[3]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>
                        {activeSteps[3]
                          ? "Click to deselect this step!"
                          : "Click to select this step!"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 3</Badge>
                    <h1 className={`${conservancyError ? "text-red-600" : ""}`}>
                      Epitope Conservancy Analysis
                    </h1>
                    {conservancyError && (
                      <Image
                        src="/exclamation_emoji.svg"
                        alt="Error Icon"
                        width={16}
                        height={16}
                        className="flashing-error"
                      />
                    )}
                  </div>
                  <h1
                    className={
                      conservancyError
                        ? "description-text-error"
                        : "description-text"
                    }
                  >
                    Analyse epitope conservation across variants
                  </h1>
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
                        onChange={(e) => {
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
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>
                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle className="toggle-button" variant="outline">
                      IEDB
                    </Toggle>
                  </div>
                  {advancedMode && (
                    <div className="flex w-full flex-col gap-[6px]">
                      <div className="line-seperator-box">
                        <div className="line-seperator"></div>
                      </div>
                      <div className="flex flex-row items-center gap-[12px]">
                        <h1 className="input-box-header">
                          Advanced Parameters
                        </h1>
                        <Badge variant="red">Advanced</Badge>
                      </div>
                      <div className="flex flex-col gap-[12px] mt-[12px]">
                        <h2 className="parameter-heading mt-[8px]">
                          Sequence Identity Threshold
                        </h2>
                        <div className="flex flex-row items-center gap-[8px]">
                          <Select
                            onValueChange={(value) =>
                              setComparisonOperator(value)
                            }
                          >
                            <SelectTrigger className="w-[60px]">
                              <SelectValue placeholder="<" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="less">{"<"}</SelectItem>
                              <SelectItem value="more_or_equal">
                                {">="}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            onValueChange={(value) =>
                              setIdentityThreshold(value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="100%" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100%">100%</SelectItem>
                              <SelectItem value="90%">90%</SelectItem>
                              <SelectItem value="80%">80%</SelectItem>
                              <SelectItem value="70%">70%</SelectItem>
                              <SelectItem value="60%">60%</SelectItem>
                              <SelectItem value="50%">50%</SelectItem>
                              <SelectItem value="40%">40%</SelectItem>
                              <SelectItem value="30%">30%</SelectItem>
                              <SelectItem value="20%">20%</SelectItem>
                              <SelectItem value="10%">10%</SelectItem>
                              <SelectItem value="0%">0%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen4 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[4] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[4]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen4((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Tooltip triggers when hovering anywhere on this block */}
                      <div
                        className="relative inline-block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(4);
                          if (activeSteps[4]) {
                            setIsOpen4(false);
                          } else {
                            setIsOpen4(true);
                          }
                        }}
                      >
                        <RoundIcon imageSrc="/shield_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-gray-400 check-toggle transition-colors
                                ${
                                  activeSteps[4]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>
                        {activeSteps[4]
                          ? "Click to deselect this step!"
                          : "Click to select this step!"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 4</Badge>
                    <h1>Antigenicity Screening</h1>
                  </div>
                  <h1 className="description-text">
                    Screen for antigenic potential
                  </h1>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-[0px] first-box">
                  <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h1 className="parameter-heading">Consensus Mode</h1>
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>
                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle className="toggle-button" variant="outline">
                      VaxiJen
                    </Toggle>
                  </div>
                  {advancedMode && (
                    <div className="flex w-full flex-col gap-[6px]">
                      <div className="line-seperator-box">
                        <div className="line-seperator"></div>
                      </div>
                      <div className="flex flex-row items-center gap-[12px]">
                        <h1 className="input-box-header">
                          Advanced Parameters
                        </h1>
                        <Badge variant="red">Advanced</Badge>
                      </div>
                      <div>
                        <h2 className="parameter-heading">Threshold</h2>
                        <Input
                          className="input-text w-1/6 mt-[8px]"
                          placeholder={threshold.toString()}
                          type="number"
                          onChange={(e) => {
                            // Handle threshold input change
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setThreshold(value);
                            } else {
                              setThreshold(0.4); // Reset to default if invalid input
                            }
                          }}
                        ></Input>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen5 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[5] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[5]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen5((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Tooltip triggers when hovering anywhere on this block */}
                      <div
                        className="relative inline-block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(5);
                          if (activeSteps[5]) {
                            setIsOpen5(false);
                          } else {
                            setIsOpen5(true);
                          }
                        }}
                      >
                        <RoundIcon imageSrc="/pill_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-gray-400 check-toggle transition-colors
                                ${
                                  activeSteps[5]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>
                        {activeSteps[5]
                          ? "Click to deselect this step!"
                          : "Click to select this step!"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 5</Badge>
                    <h1>Allergenicity Screening</h1>
                  </div>
                  <h1 className="description-text">
                    Screen for allergenic potential
                  </h1>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-[0px] first-box">
                  <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h1 className="parameter-heading">Consensus Mode</h1>
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>

                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle className="toggle-button" variant="outline">
                      AlgPred2
                    </Toggle>
                  </div>
                  {advancedMode && (
                    <div className="flex w-full flex-col gap-[6px]">
                      <div className="line-seperator-box">
                        <div className="line-seperator"></div>
                      </div>
                      <div className="flex flex-row items-center gap-[12px]">
                        <h1 className="input-box-header">
                          Advanced Parameters
                        </h1>
                        <Badge variant="red">Advanced</Badge>
                      </div>
                      <div>
                        <h2 className="parameter-heading">
                          Threshold (must be between -0.5 to 2.0)
                        </h2>
                        <Input
                          className="input-text w-1/6 mt-[8px]"
                          placeholder={allergenicityThreshold.toString()}
                          type="number"
                          onChange={(e) => {
                            // Handle threshold input change
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setAllergenicityThreshold(value);
                            } else {
                              setAllergenicityThreshold(0.3); // Reset to default if invalid input
                            }
                          }}
                        ></Input>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen6 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[6] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[6]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen6((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="relative inline-block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(6);
                          if (activeSteps[6]) {
                            setIsOpen6(false);
                          } else {
                            setIsOpen6(true);
                          }
                        }}
                      >
                        <RoundIcon imageSrc="/biohazard_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-gray-400 check-toggle transition-colors
                                ${
                                  activeSteps[6]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>
                        {activeSteps[6]
                          ? "Click to deselect this step!"
                          : "Click to select this step!"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 6</Badge>
                    <h1>Toxicity Screening</h1>
                  </div>
                  <h1 className="description-text">
                    Assess toxicity potential
                  </h1>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-[0px] first-box">
                  <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h1 className="parameter-heading">Consensus Mode</h1>
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>
                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle className="toggle-button" variant="outline">
                      ToxinPred
                    </Toggle>
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen7 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[7] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[7]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen7((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="relative inline-block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(7);
                          if (activeSteps[7]) {
                            setIsOpen7(false);
                          } else {
                            setIsOpen7(true);
                          }
                        }}
                      >
                        <RoundIcon imageSrc="/barchart_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-gray-400 check-toggle transition-colors
                                ${
                                  activeSteps[7]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>
                        {activeSteps[7]
                          ? "Click to deselect this step!"
                          : "Click to select this step!"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 7</Badge>
                    <h1>Cytokine Analysis</h1>
                  </div>
                  <h1 className="description-text">
                    Predict cytokine induction profile
                  </h1>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-[0px] first-box">
                  <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h1 className="parameter-heading">Consensus Mode</h1>
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>
                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle className="toggle-button" variant="outline">
                      C-Imm-Sim
                    </Toggle>
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <Accordion
          type="single"
          value={isOpen8 ? "item-1" : "item-0"}
          collapsible
        >
          <AccordionItem value="item-1">
            <div
              className={`accordion-wrapper ${
                !activeSteps[8] ? "opacity-50" : ""
              }`}
            >
              <AccordionTrigger
                className="first-box-accordion"
                onClick={(e) => {
                  if (!activeSteps[8]) {
                    e.preventDefault(); // this blocks the expansion when the step is not selected
                  } else {
                    setIsOpen8((prev) => !prev); // toggle accordion freely when active
                  }
                }}
              >
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="relative inline-block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(8);
                          if (activeSteps[8]) {
                            setIsOpen8(false);
                          } else {
                            setIsOpen8(true);
                          }
                        }}
                      >
                        <RoundIcon imageSrc="/globe_emoji.svg" />
                        <div
                          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border-[2px] border-gray-400 check-toggle transition-colors
                                ${
                                  activeSteps[8]
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-transparent"
                                }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>
                        {activeSteps[8]
                          ? "Click to deselect this step!"
                          : "Click to select this step!"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="flex flex-row items-center gap-[12px] w-full">
                    <Badge variant="step_badge">Step 8</Badge>
                    <h1>Population Coverage Analysis</h1>
                  </div>
                  <h1 className="description-text">
                    Calculate population coverage
                  </h1>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-[0px] first-box">
                  <div className="consensus-box flex flex-row justify-between items-center gap-[4px] w-full ">
                    <div className="flex flex-col gap-[8px] w-full">
                      <h1 className="parameter-heading">Consensus Mode</h1>
                      <h2 className="parameter-description">
                        Use all available methods for consensus prediction
                      </h2>
                    </div>
                    <Switch
                      checked={s2Consensus}
                      onCheckedChange={setS2Consensus}
                    ></Switch>
                  </div>
                  <h1
                    className={`parameter-heading transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden`}
                  >
                    Select Methods
                  </h1>
                  <div
                    className={`
                                    grid grid-cols-2 gap-[6px] w-full
                                    transition-all duration-300 ease-in-out
                                    ${
                                      s2Consensus
                                        ? "opacity-0 max-h-0 pointer-events-none"
                                        : "opacity-100 max-h-40"
                                    }
                                    overflow-hidden
                                `}
                  >
                    <Toggle className="toggle-button" variant="outline">
                      IEDB
                    </Toggle>
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-center mt-[8px] mb-[36px]">
          <Button
            className="run-button"
            onClick={handleSubmit}
            disabled={sequence.length === 0 && uploadedFiles.length === 0}
          >
            <Image
              src="/play.svg"
              alt="Run Pipeline"
              width={16}
              height={16}
              priority
            />
            <h2 className="run-text">Run Pipeline</h2>
          </Button>
        </div>
      </main>
      <footer className="footer_style flex mt-auto w-full">
        <Chat />
      </footer>
    </div>
  );
}
