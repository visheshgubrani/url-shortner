"use client"

import { useState } from "react"

export default function URLShortener() {
  const [url, setUrl] = useState("")
  const [shortenedUrl, setShortenedUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setShortenedUrl("")
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kagenou.xyz/api/shorten'
    console.log("Submitting URL:", url) // Debug log

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }), // Changed from originalUrl to url
      })

      console.log("Response status:", response.status) // Debug log
      console.log("Full request URL:", `${process.env.NEXT_PUBLIC_API_URL}`)
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to shorten URL")
      }

      const data = await response.json()
      console.log("Response data:", data) // Debug log

      // Update this line to use the correct property names from your backend response
      setShortenedUrl(data.shortUrl)
    } catch (err) {
      console.error("Error:", err) // Debug log
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while shortening the URL. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shortenedUrl)
      .then(() => {
        alert("Shortened URL copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          URL Shortener
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter your URL
            </label>
            <input
              type="url"
              id="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {error && (
          <div
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {shortenedUrl && (
          <div className="mt-6">
            <label
              htmlFor="shortened"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shortened URL
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                id="shortened"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={shortenedUrl}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
