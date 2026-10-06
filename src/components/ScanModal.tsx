import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  ScanLine,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  HelpCircle,
  Calendar,
  Tag,
  Hash,
  Package,
} from 'lucide-react';
import { GeminiExtractedData, Product, CATEGORIES } from '../types';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (productData: any) => Promise<void>;
  onViewExistingProduct?: (product: Product) => void;
}

type ScanMode = 'oneshot' | 'barcode' | 'manual';

type ScanStep =
  | 'oneshot_capture'
  | 'barcode_scan'
  | 'product_identified'
  | 'expiry_capture'
  | 'processing'
  | 'ambiguous_resolve'
  | 'review';

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  onViewExistingProduct,
}) => {
  if (!isOpen) return null;

  // Active scanning mode: default to oneshot (fastest)
  const [scanMode, setScanMode] = useState<ScanMode>('oneshot');
  const [step, setStep] = useState<ScanStep>('oneshot_capture');

  // Video and stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Workflow states
  const [barcodeInput, setBarcodeInput] = useState('');
  const [identifiedProduct, setIdentifiedProduct] = useState<{
    productName: string;
    brand: string;
    category: string;
    packageSize: string;
    barcode: string;
  } | null>(null);

  const [capturedExpiryImage, setCapturedExpiryImage] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Analyzing packaging label with Gemini...');

  // Ambiguous date resolver
  const [ambiguousChoices, setAmbiguousChoices] = useState<string[]>([]);

  // Editable Review Form state (Section 25)
  const [reviewData, setReviewData] = useState({
    productName: '',
    brand: '',
    barcode: '',
    category: 'Food',
    packageSize: '1 unit',
    quantity: 1,
    unit: 'pcs',
    expiryDate: '',
    expiryType: 'expiry' as 'expiry' | 'use_by' | 'best_before' | 'unknown',
    batchNumber: '',
    manufacturingDate: '',
    notes: '',
    source: 'combined' as Product['source'],
    confidenceScore: 0.95,
  });

  // Duplicate warning state (Section 44)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean;
    message?: string;
    existingProduct?: Product;
  }>({ isDuplicate: false });

  const [saving, setSaving] = useState(false);

  // Start Camera Stream only when user reaches a camera step (Section 19)
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access unavailable. You can upload an image or enter details manually.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Close modal cleanup
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Camera life-cycle
  useEffect(() => {
    if (step === 'oneshot_capture' || step === 'barcode_scan' || step === 'expiry_capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  // Barcode Detection API loop (if supported in browser)
  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;

    if (step === 'barcode_scan' && stream && videoRef.current) {
      // Check if native BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });

        const detect = async () => {
          if (videoRef.current && videoRef.current.readyState === 4 && !isCancelled) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                const detectedCode = barcodes[0].rawValue;
                handleBarcodeDetected(detectedCode);
                return;
              }
            } catch (e) {
              // frame detection error
            }
          }
          if (!isCancelled) {
            animationFrameId = requestAnimationFrame(detect);
          }
        };
        detect();
      }
    }

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [step, stream]);

  // Handle detected barcode: Lookup metadata (Section 20)
  const handleBarcodeDetected = async (code: string) => {
    setBarcodeInput(code);
    stopCamera();

    try {
      const res = await fetch('/api/scan/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code }),
      });
      const data = await res.json();

      if (data.success && data.found && data.data) {
        setIdentifiedProduct({
          productName: data.data.productName || 'Identified Product',
          brand: data.data.brand || '',
          category: data.data.category || 'Food',
          packageSize: data.data.packageSize || '1 unit',
          barcode: code,
        });
      } else {
        setIdentifiedProduct({
          productName: '',
          brand: '',
          category: 'Food',
          packageSize: '1 unit',
          barcode: code,
        });
      }
      setStep('product_identified');
    } catch (e) {
      setIdentifiedProduct({
        productName: '',
        brand: '',
        category: 'Food',
        packageSize: '1 unit',
        barcode: code,
      });
      setStep('product_identified');
    }
  };

  // Capture Frame from video stream
  const capturePhoto = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Trigger snapshot for expiry label
  const handleTakeExpiryPhoto = async () => {
    const photoDataUrl = capturePhoto();
    if (photoDataUrl) {
      setCapturedExpiryImage(photoDataUrl);
      stopCamera();
      await analyzeExpiryImageWithGemini(photoDataUrl);
    }
  };

  // Upload file handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCapturedExpiryImage(dataUrl);
      stopCamera();
      await analyzeExpiryImageWithGemini(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Gemini 3.8 Flash Vision Packaging Analysis
  const analyzeExpiryImageWithGemini = async (imageBase64: string) => {
    setStep('processing');
    setIsProcessingAI(true);
    setProcessingStatus('Distinguishing EXPIRY vs MANUFACTURING dates...');

    try {
      const res = await fetch('/api/scan/analyze-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          barcode: identifiedProduct?.barcode || barcodeInput || '',
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.message || 'Could not analyze packaging.');
      }

      const extracted: GeminiExtractedData = json.data;

      // Check if ambiguous date format detected (Section 23)
      if (extracted.isAmbiguousDate && extracted.ambiguousOptions && extracted.ambiguousOptions.length >= 2) {
        setAmbiguousChoices(extracted.ambiguousOptions);
        setStep('ambiguous_resolve');
        setReviewData((prev) => ({
          ...prev,
          productName: identifiedProduct?.productName || extracted.productName || 'Scanned Item',
          brand: identifiedProduct?.brand || extracted.brand || '',
          barcode: identifiedProduct?.barcode || extracted.barcode || barcodeInput || '',
          category: identifiedProduct?.category || extracted.category || 'Food',
          packageSize: identifiedProduct?.packageSize || extracted.packageSize || '1 unit',
          batchNumber: extracted.batchNumber || '',
          expiryType: extracted.expiryType || 'expiry',
          notes: extracted.notes || '',
          confidenceScore: extracted.confidence?.expiryDate || 0.85,
        }));
        return;
      }

      populateReview(extracted);
    } catch (err: any) {
      console.error(err);
      // Fallback manual review on failure: leave expiryDate empty so user picks it
      populateReview({
        productName: identifiedProduct?.productName || '',
        brand: identifiedProduct?.brand || '',
        barcode: identifiedProduct?.barcode || barcodeInput || '',
        category: identifiedProduct?.category || 'Food',
        packageSize: identifiedProduct?.packageSize || '1 unit',
        expiryDate: '',
        expiryType: 'expiry',
        datePrecision: 'DAY',
        batchNumber: '',
        isAmbiguousDate: false,
        ambiguousOptions: [],
        confidence: { productName: 0.5, expiryDate: 0.1, batchNumber: 0.3 },
        notes: 'Could not auto-read expiry stamp from image. Please enter expiry date.',
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const populateReview = async (extracted: Partial<GeminiExtractedData>) => {
    const finalReview = {
      productName: identifiedProduct?.productName || extracted.productName || 'Scanned Item',
      brand: identifiedProduct?.brand || extracted.brand || '',
      barcode: identifiedProduct?.barcode || extracted.barcode || barcodeInput || '',
      category: identifiedProduct?.category || extracted.category || 'Food',
      packageSize: identifiedProduct?.packageSize || extracted.packageSize || '1 unit',
      quantity: 1,
      unit: 'pcs',
      expiryDate: extracted.expiryDate || new Date().toISOString().split('T')[0],
      expiryType: (extracted.expiryType as any) || 'expiry',
      batchNumber: extracted.batchNumber || '',
      manufacturingDate: extracted.manufacturingDate || '',
      notes: extracted.notes || '',
      source: identifiedProduct?.barcode ? ('combined' as const) : ('camera' as const),
      confidenceScore: extracted.confidence?.expiryDate || 0.92,
    };

    setReviewData(finalReview);

    // Run Duplicate Check (Section 44)
    try {
      const dupRes = await fetch('/api/products/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: finalReview.barcode,
          productName: finalReview.productName,
          expiryDate: finalReview.expiryDate,
        }),
      });
      const dupData = await dupRes.json();
      if (dupData.isDuplicate) {
        setDuplicateWarning(dupData);
      } else {
        setDuplicateWarning({ isDuplicate: false });
      }
    } catch (e) {
      setDuplicateWarning({ isDuplicate: false });
    }

    setStep('review');
  };

  // Submit and save product
  const handleConfirmAndSave = async () => {
    if (!reviewData.productName || !reviewData.expiryDate) return;
    setSaving(true);
    try {
      await onSaveProduct({
        ...reviewData,
        imageUrl: capturedExpiryImage || '',
      });
      handleClose();
    } catch (e) {
      console.error('Error saving product:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                {step === 'oneshot_capture' && '1-Snap Smart Scan (AI Product + Expiry)'}
                {step === 'barcode_scan' && 'Step 1: Scan Barcode'}
                {step === 'product_identified' && 'Step 2: Product Identified'}
                {step === 'expiry_capture' && 'Step 3: Scan Expiry Date'}
                {step === 'processing' && 'Analyzing Packaging with Gemini...'}
                {step === 'ambiguous_resolve' && 'Date Format Ambiguity'}
                {step === 'review' && 'Review & Confirm Tracking'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {step === 'oneshot_capture' && 'Take 1 photo of the product package & expiry stamp'}
                {step === 'barcode_scan' && 'Point camera at the barcode to identify product'}
                {step === 'product_identified' && 'Confirm product details then scan packaging date'}
                {step === 'expiry_capture' && 'Photograph EXP, USE BY, or BEST BEFORE stamp'}
                {step === 'review' && 'Verify extracted dates before scheduling 5-day reminders'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Mode Switcher Tabs */}
        {(step === 'oneshot_capture' || step === 'barcode_scan') && (
          <div className="px-5 pt-3 flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <button
              onClick={() => {
                setScanMode('oneshot');
                setStep('oneshot_capture');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                scanMode === 'oneshot'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Snap Smart Scan</span>
            </button>

            <button
              onClick={() => {
                setScanMode('barcode');
                setStep('barcode_scan');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                scanMode === 'barcode'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Barcode + Expiry</span>
            </button>

            <button
              onClick={() => {
                const today = new Date();
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
                populateReview({
                  productName: '',
                  brand: '',
                  barcode: '',
                  category: 'Food',
                  packageSize: '1 unit',
                  expiryDate: in7Days.toISOString().split('T')[0],
                  expiryType: 'expiry',
                  datePrecision: 'DAY',
                  batchNumber: '',
                });
              }}
              className="py-2 px-3 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Manual
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 0: 1-SNAP SMART SCAN (Zero-Effort Single Photo Mode) */}
          {step === 'oneshot_capture' && (
            <div className="space-y-4 text-center">
              {/* Explanatory educational card addressing user query */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-left flex items-start space-x-2 text-xs text-emerald-950 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Why snap the package?</strong> Retail barcodes (UPC/EAN) only tell you the product name and brand—they never contain when your specific carton expires. <strong>1-Snap Smart Scan</strong> uses Gemini AI to detect both the product name AND physical expiry date from a single photo!
                </div>
              </div>

              {/* Camera Viewfinder */}
              <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Target overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  <div className="w-full max-w-xs h-48 border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center bg-emerald-500/10 p-3 shadow-lg">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase bg-black/70 px-3 py-1 rounded-full mb-1">
                      PRODUCT + EXPIRY STAMP
                    </span>
                    <p className="text-[10px] text-zinc-200 text-center">
                      Capture product front or label showing expiry date
                    </p>
                  </div>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  onClick={handleTakeExpiryPhoto}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>📸 Snap & Detect Everything (1 Tap)</span>
                </button>

                <label className="py-3.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Quick Sample Test Bar */}
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-left space-y-2 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  ⚡ Quick Test Samples (Instantly Populate & Test)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: '🥛 Whole Milk 1L', code: '025293600270' },
                    { name: '🍞 Sourdough Bread', code: '041220789012' },
                    { name: '🧴 CeraVe Cream', code: '3606000537452' },
                    { name: '🐶 Salmon Dog Food', code: '859610001234' },
                    { name: '🍅 Diced Tomatoes', code: '043000014022' },
                  ].map((sample) => (
                    <button
                      key={sample.code}
                      onClick={() => handleBarcodeDetected(sample.code)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {sample.name} ({sample.code})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* STEP 1: BARCODE SCANNING (Section 19) */}
          {step === 'barcode_scan' && (
            <div className="space-y-4 text-center">
              {/* Camera Viewfinder */}
              <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Target overlay: Section 19 layout */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-36 border-2 border-emerald-400/80 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5 relative shadow-lg">
                    <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase bg-black/60 px-3 py-1 rounded-full mb-2">
                      SCAN BARCODE
                    </span>
                    <div className="w-48 h-0.5 bg-emerald-400 animate-pulse shadow-sm"></div>
                  </div>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Alternative inputs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Or enter barcode manually (e.g. 025293600270)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (barcodeInput.trim()) {
                        handleBarcodeDetected(barcodeInput.trim());
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors cursor-pointer"
                  >
                    Lookup
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400">
                    <Upload className="w-4 h-4" />
                    <span>Upload Barcode Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>

                  <button
                    onClick={() => {
                      setIdentifiedProduct(null);
                      setStep('expiry_capture');
                    }}
                    className="hover:underline text-zinc-600 dark:text-zinc-300 font-medium"
                  >
                    Skip Barcode & Scan Expiry Label →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRODUCT IDENTIFIED (Section 20) */}
          {step === 'product_identified' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Product Identified from Barcode</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    {identifiedProduct?.productName || 'Unregistered Product'}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {identifiedProduct?.brand ? `Brand: ${identifiedProduct.brand} • ` : ''}
                    Category: {identifiedProduct?.category} • Code: {identifiedProduct?.barcode}
                  </p>
                </div>
              </div>

              {/* Critical Prompt: Section 21 */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                    Now scan the physical expiry date
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                    Remember: Barcodes identify the product type, but the expiry stamp printed on the physical container determines shelf life.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => setStep('expiry_capture')}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera for Expiry Stamp</span>
                  </button>
                  <label className="flex-1 py-3 px-4 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Label Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <button
                  onClick={() => {
                    const today = new Date();
                    const in7Days = new Date(today);
                    in7Days.setDate(today.getDate() + 7);
                    populateReview({
                      productName: identifiedProduct?.productName || '',
                      brand: identifiedProduct?.brand || '',
                      barcode: identifiedProduct?.barcode || '',
                      category: identifiedProduct?.category || 'Food',
                      packageSize: identifiedProduct?.packageSize || '1 unit',
                      expiryDate: in7Days.toISOString().split('T')[0],
                      expiryType: 'expiry',
                      datePrecision: 'DAY',
                      batchNumber: '',
                    });
                  }}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline pt-2 block mx-auto"
                >
                  Enter date manually without scanning →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EXPIRY IMAGE CAPTURE (Section 21) */}
          {step === 'expiry_capture' && (
            <div className="space-y-4 text-center">
              <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Expiry Label Target Aiming Box */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-72 h-36 border-2 border-dashed border-amber-400 rounded-xl flex flex-col items-center justify-center bg-amber-500/10 p-2 shadow-lg">
                    <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase bg-black/60 px-2.5 py-0.5 rounded-full mb-1">
                      ALIGN EXP / USE BY / BEST BEFORE
                    </span>
                    <p className="text-[10px] text-zinc-300 text-center">
                      Point at printed date stamp or batch code
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleTakeExpiryPhoto}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Expiry Date</span>
                </button>

                <label className="py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm flex items-center space-x-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Gemini will automatically distinguish EXP from MFG dates</span>
              </div>
            </div>
          )}

          {/* STEP: PROCESSING (Section 52) */}
          {step === 'processing' && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-950"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                <Sparkles className="w-6 h-6 text-emerald-500 absolute inset-0 m-auto" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Processing Packaging Label...
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  {processingStatus}
                </p>
              </div>

              <div className="space-y-1.5 max-w-xs mx-auto text-left text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scanning text tokens & date stamps</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Separating manufacturing vs expiry</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Extracting batch code & date format</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP: AMBIGUOUS DATE RESOLVER (Section 23) */}
          {step === 'ambiguous_resolve' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Which date is printed on the package?
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    The printed label format is ambiguous (Day/Month vs Month/Day). Please choose the intended date:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {ambiguousChoices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => {
                      setReviewData((prev) => ({ ...prev, expiryDate: choice }));
                      setStep('review');
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-800 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-500 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100 shadow-sm transition-all"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW SCREEN (Section 25) */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Duplicate Detection Warning (Section 44) */}
              {duplicateWarning.isDuplicate && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">This product may already be tracked:</strong>
                      <span>
                        {duplicateWarning.existingProduct?.productName} (Expires {duplicateWarning.existingProduct?.expiryDate})
                      </span>
                    </div>
                  </div>
                  {onViewExistingProduct && duplicateWarning.existingProduct && (
                    <button
                      onClick={() => {
                        handleClose();
                        onViewExistingProduct(duplicateWarning.existingProduct!);
                      }}
                      className="ml-2 text-xs font-bold underline shrink-0 hover:text-amber-700"
                    >
                      View Existing
                    </button>
                  )}
                </div>
              )}

              {/* Confidence Badge (Section 25 & 63) */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  We found this (Review Information)
                </span>
                {reviewData.confidenceScore >= 0.8 ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{Math.round(reviewData.confidenceScore * 100)}% Confidence</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>⚠ Needs confirmation</span>
                  </span>
                )}
              </div>

              {/* Editable Fields (Section 25) */}
              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={reviewData.productName}
                    onChange={(e) => setReviewData({ ...reviewData, productName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Brand & Barcode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={reviewData.brand}
                      onChange={(e) => setReviewData({ ...reviewData, brand: e.target.value })}
                      placeholder="e.g. Horizon Organic"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={reviewData.barcode}
                      onChange={(e) => setReviewData({ ...reviewData, barcode: e.target.value })}
                      placeholder="e.g. 025293600270"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Expiry Date & Expiry Type (CRITICAL) */}
                <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={reviewData.expiryDate}
                      onChange={(e) => setReviewData({ ...reviewData, expiryDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-sm font-bold text-emerald-900 dark:text-emerald-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      Expiry Type
                    </label>
                    <select
                      value={reviewData.expiryType}
                      onChange={(e) => setReviewData({ ...reviewData, expiryType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="expiry">Expiry (EXP)</option>
                      <option value="use_by">Use By</option>
                      <option value="best_before">Best Before (BB)</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                {/* Batch Number & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Batch / Lot #
                    </label>
                    <input
                      type="text"
                      value={reviewData.batchNumber}
                      onChange={(e) => setReviewData({ ...reviewData, batchNumber: e.target.value })}
                      placeholder="e.g. B24091"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Category
                    </label>
                    <select
                      value={reviewData.category}
                      onChange={(e) => setReviewData({ ...reviewData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Package Size, Quantity & Unit */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Package Size
                    </label>
                    <input
                      type="text"
                      value={reviewData.packageSize}
                      onChange={(e) => setReviewData({ ...reviewData, packageSize: e.target.value })}
                      placeholder="500 ml"
                      className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reviewData.quantity}
                      onChange={(e) => setReviewData({ ...reviewData, quantity: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={reviewData.unit}
                      onChange={(e) => setReviewData({ ...reviewData, unit: e.target.value })}
                      placeholder="pcs / bottles"
                      className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Actions: Section 25 [ Confirm & Save ] [ Edit ] */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleConfirmAndSave}
                  disabled={saving || !reviewData.productName || !reviewData.expiryDate}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : 'Confirm & Save Tracking'}</span>
                </button>

                <button
                  onClick={() => setStep('barcode_scan')}
                  className="py-3.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Rescan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
