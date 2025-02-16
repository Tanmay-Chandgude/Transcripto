"use client"

import { useState } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading'
import { transcribeAudio, translateContent } from '@/lib/transcription'
import { useNotification } from '@/context/NotificationContext'
import { Upload, Languages, FileText, ArrowRight, Copy, Video, FileAudio, CheckCheck, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Expanded language options using Google's supported languages
const SUPPORTED_LANGUAGES = [
  // Indian Official Languages
  { code: 'as', name: 'Assamese (অসমীয়া)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ks', name: 'Kashmiri (कश्मीरी)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
  { code: 'sd', name: 'Sindhi (سنڌي)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'bo', name: 'Tibetan (བོད་སྐད་)' },
  { code: 'brx', name: 'Bodo (बड़ो)' },
  { code: 'doi', name: 'Dogri (डोगरी)' },
  { code: 'kok', name: 'Konkani (कोंकणी)' },
  { code: 'mai', name: 'Maithili (मैथिली)' },
  { code: 'mni', name: 'Manipuri (মণিপুরী)' },
  { code: 'sat', name: 'Santali (संताली)' },

  // Major Global Languages
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'zh', name: 'Chinese - Simplified (简体中文)' },
  { code: 'zh-TW', name: 'Chinese - Traditional (繁體中文)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'fa', name: 'Persian (فارسی)' },
  { code: 'he', name: 'Hebrew (עברית)' },
  { code: 'pl', name: 'Polish (Polski)' }
].sort((a, b) => a.name.localeCompare(b.name))

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  // Add more as needed
]

const TranslationLoadingState = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    <div className="flex items-center justify-center mt-8 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span>Translating your content...</span>
    </div>
  </div>
)

export default function DashboardPage() {
  const { user } = useKindeAuth()
  const { showNotification } = useNotification()
  const [isProcessing, setIsProcessing] = useState(false)
  const [content, setContent] = useState('')
  const [translatedContent, setTranslatedContent] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [transcribedText, setTranscribedText] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [isReadyForTranslation, setIsReadyForTranslation] = useState(false)
  const [showTranscriptionActions, setShowTranscriptionActions] = useState(false)
  const [filteredLanguages, setFilteredLanguages] = useState(SUPPORTED_LANGUAGES)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Clear previous states
    setTranslatedContent('')
    setTranscribedText('')
    setContent('')
    
    // Update file states
    setUploadedFile(file)
    setUploadedFileName(file.name)
    setIsTranscribing(true)

    try {
      const transcription = await transcribeAudio(file, user.id)
      setTranscribedText(transcription)
      setContent(transcription)
      showNotification({
        title: 'Success',
        message: 'Media transcribed successfully',
        type: 'success'
      })
    } catch (error) {
      showNotification({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to transcribe media',
        type: 'error'
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'document') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      showNotification({
        title: 'Error',
        message: 'File size must be less than 25MB',
        type: 'error'
      })
      return
    }

    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setContent(text)
      setTextContent(text)
      showNotification({
        title: 'Success',
        message: 'Document loaded successfully',
        type: 'success'
      })
    }
    reader.readAsText(file)
  }

  const handleTranslate = async () => {
    if (!content || !selectedLanguage) return

    setIsProcessing(true)
    try {
      const translated = await translateContent(content, selectedLanguage)
      setTranslatedContent(translated)
      showNotification({
        title: 'Success',
        message: 'Content translated successfully',
        type: 'success'
      })
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to translate content',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    showNotification({
      title: 'Success',
      message: 'Content copied to clipboard',
      type: 'success'
    })

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transcripto.</h1>
        <p className="text-gray-600 mb-8">Transform your content into any language with AI-powered translation</p>

        <Tabs defaultValue="transcribe" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger 
              value="transcribe"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Transcribe
            </TabsTrigger>
            <TabsTrigger 
              value="translate"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Translate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcribe">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileAudio className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>Upload Media</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* File Upload Section */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <Input
                      type="file"
                      accept="audio/*,video/*,.mp3,.mp4,.wav,.avi,.mov,.m4a,.ogg,.webm"
                      onChange={handleMediaUpload}
                      disabled={isTranscribing}
                      className="hidden"
                      id="media-upload"
                    />
                    <label 
                      htmlFor="media-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {uploadedFileName ? (
                        <>
                          <div className="p-2 bg-blue-50 rounded-full">
                            {uploadedFile?.type.startsWith('video/') ? (
                              <Video className="h-8 w-8 text-blue-600" />
                            ) : (
                              <FileAudio className="h-8 w-8 text-blue-600" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-blue-600 mt-2">
                            {uploadedFileName}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) + ' MB' : ''}
                          </span>
                          <span className="text-xs text-blue-500 mt-1">
                            Click to change file
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            Drag & drop or click to upload
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            Supports audio (.mp3, .wav, .m4a, .ogg) and video (.mp4, .webm, .mov, .avi)
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {isTranscribing && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
                      <span className="text-blue-600">Transcribing your media...</span>
                    </div>
                  )}

                  {/* Transcribed Content and Translation Options */}
                  {transcribedText && !isTranscribing && (
                    <div className="space-y-4">
                      {/* Show Transcribed Content First */}
                      <div className="relative">
                        <div className="absolute -top-3 left-4 px-2 bg-white">
                          <label className="text-sm font-medium text-gray-600">
                            Transcribed Content
                          </label>
                        </div>
                        <Textarea
                          value={transcribedText}
                          readOnly
                          className="min-h-[200px] border-2"
                        />
                      </div>

                      {/* Translation Options */}
                      <div className="relative flex-1" style={{ zIndex: 50 }}>
                        <div className="absolute -top-3 left-4 px-2 bg-white">
                          <label className="text-sm font-medium text-gray-600">
                            Translate To
                          </label>
                        </div>
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                        >
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select target language" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search languages..."
                                className="mb-2"
                                onChange={(e) => {
                                  const search = e.target.value.toLowerCase()
                                  const filtered = SUPPORTED_LANGUAGES.filter(lang => 
                                    lang.name.toLowerCase().includes(search)
                                  )
                                  setFilteredLanguages(filtered)
                                }}
                              />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                              {(filteredLanguages || SUPPORTED_LANGUAGES).map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>

                        <Button 
                          onClick={handleTranslate}
                          disabled={!selectedLanguage || isProcessing}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          {isProcessing ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              Translate
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Output Section */}
              {(transcribedText || translatedContent) && (
                <Card className="border-2 border-green-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Languages className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle>{translatedContent ? 'Translation' : 'Transcription'}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(translatedContent || transcribedText)}
                        className={`transition-all duration-200 ${
                          isCopied 
                            ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isCopied}
                      >
                        {isCopied ? (
                          <>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Textarea
                      value={translatedContent || transcribedText}
                      readOnly
                      className="min-h-[400px] border-2"
                      placeholder="Output will appear here..."
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="translate">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>Input Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* File Upload */}
                  <div className="relative">
                    <div className="absolute -top-3 left-4 px-2 bg-white">
                      <label className="text-sm font-medium text-gray-600">
                        Upload Document
                      </label>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <Input
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        onChange={(e) => handleFileUpload(e, 'document')}
                        disabled={isProcessing}
                        className="hidden"
                        id="document-upload"
                      />
                      <label 
                        htmlFor="document-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        {uploadedFileName ? (
                          <>
                            <span className="text-sm font-medium text-blue-600">
                              {uploadedFileName}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              Click to change file
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-600">
                              Drag & drop or click to upload
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Supports .txt, .doc, .docx, .pdf (max 25MB)
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Text Input */}
                  <div className="relative">
                    <div className="absolute -top-3 left-4 px-2 bg-white">
                      <label className="text-sm font-medium text-gray-600">
                        Or Type Content
                      </label>
                    </div>
                    <Textarea
                      value={textContent}
                      onChange={(e) => {
                        setTextContent(e.target.value)
                        setContent(e.target.value)
                      }}
                      placeholder="Enter your content here..."
                      className="min-h-[200px] border-2 focus:border-blue-300"
                    />
                  </div>

                  {/* Language Selection */}
                  <div className="relative flex-1" style={{ zIndex: 50 }}>
                    <div className="absolute -top-3 left-4 px-2 bg-white">
                      <label className="text-sm font-medium text-gray-600">
                        Translate To
                      </label>
                    </div>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search languages..."
                            className="mb-2"
                            onChange={(e) => {
                              const search = e.target.value.toLowerCase()
                              // Filter languages based on search
                              const filtered = SUPPORTED_LANGUAGES.filter(lang => 
                                lang.name.toLowerCase().includes(search)
                              )
                              setFilteredLanguages(filtered)
                            }}
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {(filteredLanguages || SUPPORTED_LANGUAGES).map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleTranslate}
                    disabled={(!content && !textContent) || !selectedLanguage || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Translate Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card className="border-2 border-green-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Languages className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle>Translation Output</CardTitle>
                    </div>
                    {translatedContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(translatedContent)}
                        className={`transition-all duration-200 ${
                          isCopied 
                            ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isCopied}
                      >
                        {isCopied ? (
                          <>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isProcessing ? (
                    <TranslationLoadingState />
                  ) : (
                    <Textarea
                      value={translatedContent}
                      readOnly
                      className="min-h-[400px] border-2 bg-gradient-to-b from-gray-50 to-white"
                      placeholder="Translation will appear here..."
                    />
                  )}
                  
                  {translatedContent && (
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={isProcessing}
                    >
                      Save as Blog Post
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 