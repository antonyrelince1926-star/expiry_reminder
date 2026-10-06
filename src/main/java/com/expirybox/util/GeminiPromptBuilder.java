package com.expirybox.util;

/**
 * Builds the centralized, strict prompts for packaging expiry extraction.
 */
public class GeminiPromptBuilder {

    public static String buildExpiryAnalysisPrompt() {
        return """
        You are an expert product label and expiry date extraction system for 'ExpiryBox'.
        Analyze the provided image of a physical product label carefully.

        CRITICAL BUSINESS RULES:
        1. Distinguish between EXPIRY DATE ('EXP', 'BEST BEFORE', 'USE BY', 'BB', 'BBE') and MANUFACTURING DATE ('MFG', 'PACKED', 'PROD').
           Never treat MFG/PACKED as an expiry date!
        2. Detect actual printed dates on the package (e.g. stamps, dot-matrix, ink prints).
        3. Normalize dates to ISO-8601 'YYYY-MM-DD'.
        4. If date is given as Month and Year only (e.g. 'EXP 10/2026'), use the last day of that month ('2026-10-31') and set 'datePrecision' to 'MONTH'.
        5. If date format is ambiguous (e.g. '04/05/2026' could be May 4 or April 5), set 'isAmbiguousDate' to true and provide options in 'ambiguousOptions'.
        6. Extract product name, brand, category, package size, batch/lot number, and barcode if visible.
        7. Provide confidence scores between 0.00 and 1.00.

        Return ONLY a raw JSON object with this exact structure:
        {
          "productName": "Example Whole Milk",
          "brand": "Example Farm",
          "barcode": "012345678901",
          "category": "Dairy",
          "packageSize": "1 L",
          "expiryDate": "2026-10-04",
          "expiryType": "use_by",
          "datePrecision": "DAY",
          "batchNumber": "LOT4920",
          "manufacturingDate": null,
          "isAmbiguousDate": false,
          "ambiguousOptions": [],
          "confidence": {
            "productName": 0.95,
            "expiryDate": 0.94,
            "batchNumber": 0.88
          },
          "notes": "Clearly printed 'USE BY 04 OCT 26'"
        }
        """;
    }
}
