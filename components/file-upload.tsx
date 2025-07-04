"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { FileImage, File, Loader2 } from "lucide-react"

interface FileUploadProps {
  onUpload: (url: string, filename: string) => void
  accept?: string
  maxSize?: number // in MB
  type?: string
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5,
  type = "general",
  multiple = false,
  className = "",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFiles = async (files: FileList) => {
    if (!files.length) return

    const file = files[0] // Handle single file for now

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&type=${type}`, {
        method: "POST",
        body: file,
      })

      const data = await response.json()

      if (data.success) {
        onUpload(data.url, data.filename)
        toast({
          title: "Upload successful",
          description: "File uploaded successfully",
        })
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={`${className} ${dragActive ? "border-blue-500 bg-blue-50" : ""}`}>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {accept.includes("image") ? (
                <FileImage className="h-8 w-8 text-gray-400 mb-2" />
              ) : (
                <File className="h-8 w-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your file here, or{" "}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">Max file size: {maxSize}MB</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
