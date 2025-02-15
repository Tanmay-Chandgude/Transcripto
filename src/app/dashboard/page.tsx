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
  // Official Indian Languages
  { code: 'as', name: 'Assamese (অসমীয়া)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'bho', name: 'Bhojpuri (भोजपुरी)' },
  { code: 'brx', name: 'Bodo (बड़ो)' },
  { code: 'doi', name: 'Dogri (डोगरी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ks', name: 'Kashmiri (कश्मीरी)' },
  { code: 'gom', name: 'Konkani (कोंकणी)' },
  { code: 'mai', name: 'Maithili (मैथिली)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mni', name: 'Manipuri (মণিপুরী)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ne', name: 'Nepali (नेपाली)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
  { code: 'sat', name: 'Santali (संताली)' },
  { code: 'sd', name: 'Sindhi (سنڌي)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ur', name: 'Urdu (اردو)' },

  // Major World Languages
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'eu', name: 'Basque (Euskara)' },
  { code: 'bg', name: 'Bulgarian (български)' },
  { code: 'my', name: 'Burmese (မြန်မာစာ)' },
  { code: 'zh', name: 'Chinese - Simplified (简体中文)' },
  { code: 'zh-TW', name: 'Chinese - Traditional (繁體中文)' },
  { code: 'hr', name: 'Croatian (Hrvatski)' },
  { code: 'cs', name: 'Czech (Čeština)' },
  { code: 'da', name: 'Danish (Dansk)' },
  { code: 'nl', name: 'Dutch (Nederlands)' },
  { code: 'en', name: 'English' },
  { code: 'et', name: 'Estonian (Eesti)' },
  { code: 'tl', name: 'Filipino (Tagalog)' },
  { code: 'fi', name: 'Finnish (Suomi)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'el', name: 'Greek (Ελληνικά)' },
  { code: 'he', name: 'Hebrew (עברית)' },
  { code: 'hu', name: 'Hungarian (Magyar)' },
  { code: 'is', name: 'Icelandic (Íslenska)' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)' },
  { code: 'ga', name: 'Irish (Gaeilge)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'lv', name: 'Latvian (Latviešu)' },
  { code: 'lt', name: 'Lithuanian (Lietuvių)' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)' },
  { code: 'mt', name: 'Maltese (Malti)' },
  { code: 'no', name: 'Norwegian (Norsk)' },
  { code: 'fa', name: 'Persian (فارسی)' },
  { code: 'pl', name: 'Polish (Polski)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ro', name: 'Romanian (Română)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'sr', name: 'Serbian (Српски)' },
  { code: 'sk', name: 'Slovak (Slovenčina)' },
  { code: 'sl', name: 'Slovenian (Slovenščina)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'sw', name: 'Swahili (Kiswahili)' },
  { code: 'sv', name: 'Swedish (Svenska)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'uk', name: 'Ukrainian (Українська)' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'cy', name: 'Welsh (Cymraeg)' }
].sort((a, b) => a.name.localeCompare(b.name))

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
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [transcribedText, setTranscribedText] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [textContent, setTextContent] = useState('')

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setIsTranscribing(true)
    setTranslatedContent('') // Clear previous translation

    try {
      const transcription = await transcribeAudio(file)
      setTranscribedText(transcription)
      setContent(transcription) // Set this for translation
      showNotification({
        title: 'Success',
        message: 'Media transcribed successfully. You can now translate it.',
        type: 'success'
      })
    } catch (error) {
      showNotification({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to transcribe media',
        type: 'error'
      })
      setTranscribedText('')
      setContent('')
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedContent)
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
            <TabsTrigger value="transcribe">Transcribe</TabsTrigger>
            <TabsTrigger value="translate">Translate</TabsTrigger>
          </TabsList>

          <TabsContent value="transcribe">
            <div className="grid lg:grid-cols-2 gap-8">
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
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <Input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={isTranscribing}
                      className="hidden"
                      id="media-upload"
                    />
                    <label 
                      htmlFor="media-upload"
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
                            Supports audio and video files (max 25MB)
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {isTranscribing && (
                    <div className="space-y-4 animate-pulse">
                      <div className="flex items-center justify-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Transcribing your media...</span>
                      </div>
                    </div>
                  )}

                  {transcribedText && !isTranscribing && (
                    <div className="space-y-4">
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

                      <div className="relative" style={{ zIndex: 50 }}>
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
                          <SelectContent 
                            className="absolute w-full max-h-[300px] overflow-y-auto bg-white border rounded-md shadow-lg"
                            position="popper"
                            side="bottom"
                            sideOffset={5}
                            style={{ zIndex: 100 }}
                          >
                            <div className="sticky top-0 bg-white border-b p-2">
                              <Input
                                placeholder="Search languages..."
                                className="border-2"
                                onChange={(e) => {
                                  const searchBox = e.target.value.toLowerCase();
                                  const options = document.querySelectorAll('[data-language-option]');
                                  options.forEach(option => {
                                    const text = option.textContent?.toLowerCase() || '';
                                    if (text.includes(searchBox)) {
                                      option.classList.remove('hidden');
                                    } else {
                                      option.classList.add('hidden');
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div className="p-1">
                              {SUPPORTED_LANGUAGES.map((lang) => (
                                <SelectItem 
                                  key={lang.code} 
                                  value={lang.code}
                                  data-language-option
                                  className="cursor-pointer hover:bg-gray-100 rounded-sm px-2 py-1.5"
                                >
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={handleTranslate}
                        disabled={!transcribedText || !selectedLanguage || isProcessing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isProcessing ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            Translate Transcription
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Output Section */}
              {(content || translatedContent) && (
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
                          onClick={copyToClipboard}
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
                  <div className="relative" style={{ zIndex: 50 }}>
                    <div className="absolute -top-3 left-4 px-2 bg-white">
                      <label className="text-sm font-medium text-gray-600">
                        Target Language
                      </label>
                    </div>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                      <SelectContent 
                        className="absolute w-full max-h-[300px] overflow-y-auto bg-white border rounded-md shadow-lg"
                        position="popper"
                        side="bottom"
                        sideOffset={5}
                        style={{ zIndex: 100 }}
                      >
                        <div className="sticky top-0 bg-white border-b p-2">
                          <Input
                            placeholder="Search languages..."
                            className="border-2"
                            onChange={(e) => {
                              const searchBox = e.target.value.toLowerCase();
                              const options = document.querySelectorAll('[data-language-option]');
                              options.forEach(option => {
                                const text = option.textContent?.toLowerCase() || '';
                                if (text.includes(searchBox)) {
                                  option.classList.remove('hidden');
                                } else {
                                  option.classList.add('hidden');
                                }
                              });
                            }}
                          />
                        </div>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem 
                            key={lang.code} 
                            value={lang.code}
                            data-language-option
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {lang.name}
                          </SelectItem>
                        ))}
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
                        onClick={copyToClipboard}
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