"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"


import { useRouter } from "next/navigation"


export default function Pipeline() {
  const [ uploadedFiles, setUploadedFiles ] = useState<File[]>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const router = useRouter();

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedFiles((prev: File[]) => [...prev, file]);
      console.log("File uploaded:", file);
    }
  };

  const handleSubmit = async (event: any) => {
      event.preventDefault();

      const formData = new FormData();
      uploadedFiles.forEach(file => {
          formData.append('file_uploads', file);
      });

      try {
          const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'uploadfile/';
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

              router.push('../projects');
          } else {
              console.error("Failed to upload files.");
              const errorData = await response.json();
              console.error("Failed to upload files:", errorData.detail);
              alert("Error: " + errorData.detail);

              router.push('/upload_files/');
          }
      } catch (error) {
          console.error(error);
      }
  };

  return (
    <div className="min-h-screen max-h-screen min-w-screen max-w-screen flex flex-col main-box-1">
        <h1 className="main-heading-1">Hello 👋🏼</h1>
        <main className="pr-[55px] mt-[18px] gap-[18px] w-full max-h-3/5 overflow-hidden flex flex-col w-full gap-[16px]">
            <div className="flex flex-col gap-[4px] first-box">
                <div className="flex flex-row w-full items-center gap-[8px]">
                    <Image src="/pipeline.svg" alt="Pipeline Icon" width={16} height={16}></Image>
                    <h1>Pipeline Configuration</h1>
                </div>
                
                <div className="flex flex-row w-full items-center justify-between">
                    <div className="flex flex-col gap-[4px] w-full">
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
                    {advancedMode && <Badge variant="default">Enabled</Badge>}
                </div>
            </div>
            <h1>Pipeline Workflow</h1>
            <div className="flex flex-col gap-[4px] first-box">

            </div>
        </main>
        <footer className="footer_style flex mt-auto w-full">
            
        </footer>
    </div>
  );
}
 