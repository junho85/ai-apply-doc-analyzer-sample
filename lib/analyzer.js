const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPTS = {
  admission: `You are an automated document validation engine. Your job is to analyze the STRUCTURE and CONTENT of an Exchange Student Admission Approval Letter — NOT to verify whether the institution actually exists. Institution existence is checked separately by an external accreditation database.

Focus only on these checks:

1. **Document Structure**: Does the document follow a standard official letter format (letterhead, body, signature block, contact info)?
2. **Program Period Validity**: Is the program start date before the end date? Are the dates logically consistent?
3. **Date Consistency**: Are all dates properly formatted (valid month 1-12, valid day 1-31)? Is the issue date not set in the future beyond 2025?
4. **Document Formatting**: Is the formatting professional — consistent fonts, proper alignment, no overlapping text, no random style mixing?
5. **Official Seal/Signature**: Is a signature and/or institutional seal present?
6. **Required Fields**: Are student name, student ID, program dates, department, and contact information all present?
7. **Fraud Indicators**: Flag only clear fraud signs — impossible dates (month > 12, day > 31), end date before start date, absurdly large monetary values (> 50,000,000 KRW for a student grant), joke credentials (e.g., Ph,D,D,D,D), fake email TLDs (e.g., .fake), misspellings in key fields, unprofessional language in official body text.

Respond in JSON format:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "summary": "brief one-line verdict",
  "checks": {
    "documentStructure": { "passed": boolean, "note": "string" },
    "programPeriodValidity": { "passed": boolean, "note": "string" },
    "dateConsistency": { "passed": boolean, "note": "string" },
    "documentFormatting": { "passed": boolean, "note": "string" },
    "officialSealSignature": { "passed": boolean, "note": "string" },
    "requiredFields": { "passed": boolean, "note": "string" },
    "noFraudIndicators": { "passed": boolean, "note": "string" }
  },
  "issues": ["list of any found issues"],
  "extractedInfo": {
    "studentName": "string or null",
    "institution": "string or null",
    "programPeriod": "string or null",
    "issueDate": "string or null"
  }
}`,
};

async function analyzeDocument(doc) {
  const imagePath = path.join(__dirname, '..', 'public', 'documents', doc.filename);

  if (!fs.existsSync(imagePath)) {
    return {
      ...doc,
      error: `Image file not found: ${doc.filename}`,
      isValid: false,
      confidence: 0,
      summary: 'Document file missing',
      checks: {},
      issues: ['Document image file not found'],
      extractedInfo: {},
    };
  }

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const mimeType = 'image/png';

  const prompt = PROMPTS[doc.type] || PROMPTS.admission;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  const rawText = response.text;

  // Extract JSON from markdown code blocks if present
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
  const jsonText = jsonMatch ? jsonMatch[1] : rawText;

  const parsed = JSON.parse(jsonText.trim());

  return {
    ...doc,
    ...parsed,
    analyzedAt: new Date().toISOString(),
  };
}

async function analyzeDocuments(documents) {
  const results = await Promise.all(documents.map(analyzeDocument));
  return results;
}

module.exports = { analyzeDocuments, analyzeDocument };
