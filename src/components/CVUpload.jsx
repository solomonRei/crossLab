import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Progress } from "./ui/Progress";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Languages,
} from "lucide-react";

export function CVUpload({ onDataParsed }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, uploading, parsing, success, error
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please select a valid file type (PDF, DOC, DOCX, or TXT)");
        return;
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus("uploading");
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call OpenAI API to parse CV
      setStatus("parsing");
      setIsParsing(true);
      const parsedResult = await parseCVWithOpenAI(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (onDataParsed) {
        onDataParsed(parsedResult);
      }

      setStatus("success");
      setIsParsing(false);
      setIsUploading(false);
    } catch (err) {
      setError(err.message || "Failed to upload and parse CV");
      setStatus("error");
      setIsUploading(false);
      setIsParsing(false);
      setUploadProgress(0);
    }
  };

  const parseCVWithOpenAI = async (file) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const model = "gpt-4o-mini";

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Extract text content from the file
    let fileContent;

    if (file.type === "application/pdf") {
      // For PDFs, we need to extract text content
      try {
        fileContent = await extractTextFromPDF(file);
      } catch (error) {
        console.error("Failed to extract text from PDF:", error);
        throw new Error(
          "Failed to read PDF content. Please ensure the PDF contains text (not scanned images)."
        );
      }
    } else {
      // For text files, read as text
      fileContent = await file.text();
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a CV parser. Extract all information from the CV/resume and return ONLY valid JSON with this structure:

{
  "personalInfo": {
    "name": "Full name or null",
    "email": "Email address or null", 
    "phone": "Phone number or null",
    "location": "City, Country or null",
    "linkedin": "Full LinkedIn profile URL or null",
    "github": "Full GitHub profile URL or null"
  },
  "summary": "Professional summary or null",
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name", 
      "year": "Graduation year or null",
      "gpa": "GPA or null"
    }
  ],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Duration or null", 
      "description": "Brief description or null"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1", "language2"]
  },
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "year": "Year obtained or null"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description or null",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

IMPORTANT: Respond with ONLY the JSON object. No additional text or formatting.`,
          },
          {
            role: "user",
            content: `Parse this CV file: ${
              file.name
            }. Content: ${fileContent.substring(0, 100000)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to parse CV");
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    try {
      // Try to extract JSON if the response contains additional text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, try parsing the entire content
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Raw API response:", content);
      console.error("Parse error:", parseError);
      throw new Error(
        `Failed to parse AI response. The model returned: ${content.substring(
          0,
          200
        )}...`
      );
    }
  };

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async function (e) {
        try {
          const typedarray = new Uint8Array(e.target.result);

          // Use PDF.js to extract text
          const pdfjsLib = window["pdfjs-dist/build/pdf"];
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }

          if (fullText.trim().length === 0) {
            reject(
              new Error(
                "No text content found in PDF. The PDF might be scanned images."
              )
            );
          } else {
            resolve(fullText);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (isUploading || isParsing)
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    if (status === "success")
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (error) return "Upload Failed";
    if (isUploading) return "Uploading...";
    if (isParsing) return "Parsing CV...";
    if (status === "success") return "Successfully Parsed";
    return "No CV Uploaded";
  };

  const getStatusColor = () => {
    if (error) return "text-red-500";
    if (isUploading || isParsing) return "text-blue-500";
    if (status === "success") return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Update Profile from CV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
          {getStatusIcon()}
          <div>
            <div className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {file && (
              <div className="text-sm text-muted-foreground">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {(isUploading || isParsing) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{isUploading ? "Uploading..." : "Parsing..."}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* File Input */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="cv-upload"
            disabled={isUploading || isParsing}
          />
          <label htmlFor="cv-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {file
                ? file.name
                : "Click to select CV file (PDF, DOC, DOCX, TXT)"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Max file size: 5MB
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading || isParsing}
          className="w-full"
        >
          {isUploading || isParsing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Uploading..." : "Parsing..."}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Parse CV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
