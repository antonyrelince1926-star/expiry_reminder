# Gemini API Integration & Setup Guide

## 1. Role in ExpiryBox
Gemini is used exclusively on the server side for:
- Packaging label OCR & understanding
- Distinguishing **EXPIRY / USE BY / BEST BEFORE** from **MFG / PACKED** dates
- Extracting batch / lot numbers
- Identifying ambiguous date formats (e.g. `04/05/2026`) and suggesting confirmation options
- Estimating field-level confidence scores

**Critical Rule:** Gemini NEVER performs reminder arithmetic or date math. All calculations are executed by the deterministic Java `ExpiryEngine`.

## 2. API Key Configuration
The Gemini API key is configured solely on the backend via environment variables:
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```
Or in Tomcat `setenv.sh` / system environment. The API key is **NEVER** exposed to client JavaScript or version control.

## 3. Recommended Model
- Model: `gemini-3.8-flash`
- Modality: Image (Base64 inline data) + Text prompt
- Response Format: Structured JSON (`responseMimeType: "application/json"`)

## 4. Prompt Architecture (`GeminiPromptBuilder`)
The prompt instructs the model:
1. Examine the packaging text carefully.
2. Separate manufacturing dates (`MFG`, `PACKED`) from expiration dates (`EXP`, `BEST BEFORE`, `USE BY`).
3. Standardize dates to `YYYY-MM-DD`.
4. If format is ambiguous (e.g. `03/04/2026`), set `isAmbiguousDate: true` with options.
5. Provide confidence ratings (0.0 to 1.0) for each extracted field.
