"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  Printer,
  Save,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";

export default function DocumentEditor({
  isOpen,
  onClose,
  template,
  formData,
  buildingData,
  onSave,
  existingDocument = null,
}) {
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [documentTitle, setDocumentTitle] = useState(template?.name || "Document");
  const printRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Replace placeholders with actual data
  const replacePlaceholders = (templateContent, data) => {
    let processed = templateContent;
    const placeholders = template?.placeholders || [];

    placeholders.forEach((key) => {
      const value = data[key] || "";
      processed = processed.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    return processed;
  };

  // Initialize content when template or formData changes
  useEffect(() => {
    if (template && formData) {
      const allData = {
        ...formData,
        ...buildingData,
        agreementDate: new Date().toISOString().split('T')[0],
        customerFatherName: formData?.customerFatherName || "____",
        ownerName: formData?.ownerName || "_____",
        rentDueDate: formData?.rentDueDate || "5",
        lateFee: formData?.lateFee || "100",
        customerAddress: formData?.customerAddress || formData?.address || "",
        agreementNo: existingDocument?.id?.slice(-6) || "001",
        whatsapp: formData?.whatsapp || formData?.phone || "",
        permanentAddress: formData?.permanentAddress || formData?.address || "",
        occupation: formData?.occupation || "_____",
        emergencyContact: formData?.emergencyContact || "",
        accommodationType: formData?.accommodationType || "Hostel",
        buildingAddress: formData?.buildingAddress || formData?.address || "",
        bedNo: formData?.bedNo || "___",
        vacateDate: formData?.vacateDate || "_____",
        agreementDuration: formData?.agreementDuration || "1 Year",
        otherCharges: formData?.otherCharges || "None",
        facilities: formData?.facilities || "_____",
        assetsDescription: formData?.assetsDescription || "_____",
        ownerDesignation: formData?.ownerDesignation || "Manager",
        ownerRepresentative: formData?.ownerRepresentative || "_____",
        businessType: formData?.businessType || "_____",
        floorNumber: formData?.floorNumber || "Ground",
        seatsCount: formData?.seatsCount || "1",
        lightsCount: formData?.lightsCount || "2",
        fansCount: formData?.fansCount || "1",
        tablesCount: formData?.tablesCount || "1",
        chairsCount: formData?.chairsCount || "2",
        doorLock: formData?.doorLock || "1",
        otherItems: formData?.otherItems || "None",
      };

      const processed = replacePlaceholders(template.template, allData);
      setContent(processed);
    }
  }, [template, formData, buildingData, existingDocument]);

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentTitle}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
              body {
                font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Nastaleeq', serif;
                padding: 40px;
                line-height: 2;
                direction: rtl;
                text-align: right;
                font-size: 16px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2, h3 {
                text-align: center;
                font-weight: bold;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
              }
              .content {
                white-space: pre-wrap;
                font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
                line-height: 2.5;
              }
              .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
                padding-top: 20px;
                border-top: 1px solid #ccc;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${documentTitle}</h1>
              <p>${new Date().toLocaleDateString('ur-PK')}</p>
            </div>
            <div class="content">${content.replace(/\n/g, '<br/>')}</div>
            <div class="signature-section">
              <div>
                <p><strong>مالک مکان</strong></p>
                <p>نام: ___________</p>
                <p>دستخط: ___________</p>
                <p>تاریخ: ___________</p>
              </div>
              <div>
                <p><strong>مستاجر</strong></p>
                <p>نام: ___________</p>
                <p>دستخط: ___________</p>
                <p>تاریخ: ___________</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Handle save document
  const handleSave = async () => {
    if (!content.trim()) {
      setError("Document content cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const documentData = {
        id: existingDocument?.id || `doc-${Date.now()}`,
        templateId: template?.id,
        title: documentTitle,
        content: content,
        type: template?.type || "agreement",
        language: template?.language || "urdu",
        createdAt: existingDocument?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: (existingDocument?.version || 0) + 1,
      };

      await onSave(documentData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || "Failed to save document.");
      console.error("Save document error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <FileText size={20} />
              </div>
              <div>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="bg-transparent text-lg font-semibold text-foreground outline-none focus:border-indigo-500 border-b border-transparent focus:border-border"
                  placeholder="Document Title"
                />
                <p className="text-xs text-muted-foreground">{template?.name} • {template?.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title={isPreview ? "Edit" : "Preview"}
              >
                {isPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                onClick={handlePrint}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title="Print"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto max-h-[55vh]">
            {isPreview ? (
              <div 
                ref={printRef}
                className="prose prose-invert max-w-none bg-muted rounded-xl p-6 border border-border"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                  direction: "rtl",
                  textAlign: "right",
                  lineHeight: "2.5",
                  fontSize: "16px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {content}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[400px] rounded-xl border border-border bg-input p-4 text-sm text-foreground outline-none focus:border-indigo-500 resize-y"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                  direction: "rtl",
                  textAlign: "right",
                  lineHeight: "2.5",
                }}
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-2 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mx-5 mb-2 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
              <CheckCircle2 size={17} />
              Document saved successfully!
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || success}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              <Save size={17} />
              {loading ? "Saving..." : "Save Document"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}