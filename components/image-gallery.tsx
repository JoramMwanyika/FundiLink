"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, ZoomIn } from "lucide-react"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  onRemove?: (index: number) => void
  editable?: boolean
  className?: string
}

export function ImageGallery({ images, onRemove, editable = false, className = "" }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images.length) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-gray-500">No images uploaded yet</CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {images.map((imageUrl, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setSelectedImage(imageUrl)}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    {editable && onRemove && (
                      <Button size="sm" variant="destructive" onClick={() => onRemove(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image preview modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <Image src={selectedImage || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
              <Button
                className="absolute top-4 right-4"
                size="sm"
                variant="secondary"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
