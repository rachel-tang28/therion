"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import Image from "next/image"

import { useRouter } from "next/navigation"
import { Chat } from "@/components/ui/chat"

export default function Dashboard() {
  const [ uploadedFiles, setUploadedFiles ] = useState<File[]>([]);
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
      <header className="flex flex-col gap-[16px]">
          <h1 className="main-heading-1">Hello 👋🏼</h1>
          <div className="flex flex-col gap-[4px]">
            <h2 className="pl-[2px] input-heading">Name of Project</h2>
            <Input className="input-text w-[300px]" placeholder="Vaccine design 1"></Input>
          </div>
      </header>
      <main className="pr-[55px] mt-[18px] gap-[18px] w-full max-h-3/5 overflow-hidden">
        <div className="inner-box flex flex-col w-full gap-[16px]">
          <h1 className="inner-box-heading">Input Sequence</h1>
          <div className="flex flex-col gap-[4px]">
            <h2 className="pl-[2px] input-heading">Sequence Input</h2>
            <Textarea className="input-text w-full min-h-[200px] items-start text-start align-top" placeholder="Enter your sequence here..."></Textarea>
          </div>
          <div className="flex flex-col gap-[4px]">
            <h2 className="pl-[2px] input-heading"><span className="bolded-input-heading cursor-pointer">OR </span> upload sequence(s) from a file</h2>
            <FileUpload setFile={handleFileUpload} />
            {/* {uploadedFiles.length > 0 && (
              <h2>{uploadedFiles[0].name}</h2>
            )} */}
          </div>
        </div>
        <div className="flex justify-end mt-[18px]">
          <Button
            className="flex items-center justify-center gap-2 upload-button"
            variant="outline"
            onClick={handleSubmit}
          >
            Run Pipeline Analysis
            <Image src="/upload.svg" alt="Upload File" width={16} height={16} priority />
          </Button>
        </div>
        <Chat />
      </main>
      <footer className="footer_style flex mt-auto w-full">
        
      </footer>
    </div>
  );
}
