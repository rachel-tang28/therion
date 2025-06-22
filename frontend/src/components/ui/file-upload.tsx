import { useDropzone } from "react-dropzone";
import { useState } from "react";

interface FileUploadProps {
  setFile: (file: File | null) => void;
}

export const FileUpload = ({ setFile }: FileUploadProps) => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    setUploadedFileName(file.name); // Set the uploaded file's name
  };

  const handleDragEnter = (event: React.DragEvent) => {
    console.log("Drag Entered: " + event.detail);
  };

  const handleDragOver = (event: React.DragEvent) => {
    console.log("Dragging Over" + event.detail);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    console.log("Drag Left" + event.detail);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".fasta", ".fa"],
    },
    multiple: true,
    onDragEnter: handleDragEnter, // Handle drag enter
    onDragOver: handleDragOver,   // Handle drag over
    onDragLeave: handleDragLeave, // Handle drag leave
  });

  return (
    <div {...getRootProps()} className="drag-and-drop-box">
      <input {...getInputProps()} />
      <div className="w-full h-full flex flex-col items-center justify-center">
        {uploadedFileName ? (
          <h4 className="upload-text pt-[4px]">
            Uploaded File: <span className="upload-file-text">{uploadedFileName}</span>
          </h4>
        ) : (
          <h4 className="upload-text pt-[4px]">
            Drag and drop files or&nbsp;
            <span className="upload-blue-text cursor-pointer">browse on your computer</span>
          </h4>
        )}
      </div>
    </div>
  );
};
