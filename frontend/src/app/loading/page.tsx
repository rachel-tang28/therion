"use client"

import { useState, useEffect } from "react"
import { Loader2, Zap } from "lucide-react"

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isIndeterminate, setIsIndeterminate] = useState(true)

  const messages = [
    "Processing sequence data...",
    "Mapping potential T-cell epitopes...",
    "Performing conservancy analysis...",
    "Running antigenicity, allergenicity, and toxicity screening...",
    "Performing cytokine analysis...",
    "Population coverage analysis in progress...",
  ]

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0 // Reset for demo purposes
        }
        return prev + Math.random() * 15
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  // Cycle through messages - increase interval for longer text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 4000) // Increased from 2000 to 4000ms

    return () => clearInterval(interval)
  }, [messages.length])

  // Switch between indeterminate and determinate modes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIndeterminate(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  const estimatedTime = Math.max(1, Math.ceil((100 - progress) / 20))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header with animated icon */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full animate-ping"></div>
            <div className="relative bg-indigo-500 dark:bg-indigo-400 p-3 rounded-full">
                <div className="flex items-center justify-center w-12 h-12 text-white text-4xl animate-pulse opacity-100">🚀</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Generating Your Results</h1>
        </div>

        {/* Main progress section */}
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-3">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
              {isIndeterminate ? (
                <div className="h-full bg-gradient-to-r from-yellow-500 to-red-600 rounded-full animate-pulse">
                  <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              ) : (
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              )}
            </div>

            {!isIndeterminate && (
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{Math.round(progress)}% complete</span>
                <span>~{estimatedTime} min remaining</span>
              </div>
            )}
          </div>

          {/* Animated status text */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <p className="text-lg text-slate-700 dark:text-slate-300 font-medium animate-shimmer-text">
                {messages[currentMessage]}
              </p>
            </div>

            {/* Loading dots animation */}
            {/* <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Additional animated elements */}
        <div className="flex justify-center space-x-8 opacity-60">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI Processing</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing Data</span>
          </div>
        </div>

        {/* Subtle background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full animate-pulse [animation-delay:1s]"></div>
        </div>
      </div>
    </div>
  )
}