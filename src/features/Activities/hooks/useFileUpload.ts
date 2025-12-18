import { useState } from 'react'

export interface UseFileUploadReturn {
  file: File[]
  urls: string[]
  setFile: (files: File[]) => void
  setUrls: (urls: string[]) => void
  clearFiles: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [file, setFile] = useState<File[]>([])
  const [urls, setUrls] = useState<string[]>([])

  const clearFiles = () => {
    setFile([])
    setUrls([])
  }

  return {
    file,
    urls,
    setFile,
    setUrls,
    clearFiles
  }
}
