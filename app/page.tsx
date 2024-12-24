'use client'

import { useState } from "react"
import Image from "next/image"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Upload, FileImage, AlertCircle } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const identifyImage = async (additionalPrompt: string = "") => {
    if (!image) return

    setLoading(true)
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    try {
      const imageParts = await fileToGenerativePart(image)
      const result = await model.generateContent([ 
        `Analyze this house layout image and provide a short Vastu dosh , including the following analysis: 
          1. Directional Orientation in short (Main Entrance, Room Placement, and Usage).
          2. Vastu Dosha in short (flaws or imbalances in the layout).
          and below the this add this if want detailed report you can contact on this number 8446023005 in that report you will get 1.Basic Structure and Layout Analysis
          2. Directional Orientation Analysis
          3.Element Balancing
          4. Vastu Dosha Analysis
          5.Color Schemes and Decor
          6.Vastu Dosha Remedies
          and many more
          ${additionalPrompt}`,
        imageParts,
      ])
      const response = await result.response
      const text = response
        .text()
        .trim()
        .replace(/\`\`\`/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n")

      setResult(text)
    } catch (error) {
      console.error("Error identifying image:", error)
      setResult(error instanceof Error ? `Error identifying image: ${error.message}` : "An unknown error occurred while identifying the image.")
    } finally {
      setLoading(false)
    }
  }

  const fileToGenerativePart = (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        const base64Content = base64data.split(",")[1]
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/image-logo.jpg"
                alt="Vastu360 Logo"
                width={50}
                height={50}
                className="mr-3 rounded-full border-2 border-white"
              />
              <h1 className="text-3xl font-bold">Vastu360</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-4xl font-extrabold text-orange-800 mb-8 text-center">
              Discover Your Vastu Dosha
            </h2>
            <div className="mb-8">
              <label
                htmlFor="image-upload"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Upload your house layout
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                    >
                      <span>Upload a file</span>
                      <input id="image-upload" name="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            {image && (
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Uploaded house layout"
                    width={400}
                    height={300}
                    className="rounded-lg shadow-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <span className="text-white text-lg font-semibold">House Layout</span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => identifyImage()}
              disabled={!image || loading}
              className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg hover:bg-orange-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2" />
                  Identify Vastu Dosha
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="bg-orange-50 p-8 border-t border-orange-100">
              <h3 className="text-2xl font-bold text-orange-800 mb-4">Vastu Dosha Analysis:</h3>
              <div className="prose prose-orange max-w-none">
                {result.split("\n").map((line, index) => {
                  const isVastuDosha = line.toLowerCase().includes("vastu dosha");
                  return (
                    <p key={index} className={`mb-2 ${isVastuDosha ? "text-red-600 font-semibold flex items-center" : "text-gray-800"}`}>
                      {isVastuDosha && <AlertCircle className="mr-2 h-5 w-5" />}
                      {line}
                    </p>
                  );
                })}
              </div>
              <button
                onClick={() => window.open("https://forms.gle/BfbynytCCSfZmAEr9", "_blank")}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out mt-6 font-semibold text-lg flex items-center justify-center"
              >
                <FileImage className="mr-2" />
                View Detailed Report
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

