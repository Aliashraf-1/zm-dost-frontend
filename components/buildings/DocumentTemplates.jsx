"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { documentTemplates } from "@/data/documentTemplates";

export default function DocumentTemplates({ 
  onSelectTemplate, 
  onViewExisting,
  existingDocuments = [],
  disabled = false 
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    setExpanded(false);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-indigo-400" />
          <span className="text-sm font-medium text-card-foreground">Document Templates</span>
          {existingDocuments.length > 0 && (
            <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">
              {existingDocuments.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          disabled={disabled}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              Hide Templates
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              {selectedTemplate ? "Change Template" : "Select Template"}
            </>
          )}
        </button>
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && !expanded && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{selectedTemplate.name}</p>
              <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onViewExisting) {
                  onViewExisting(selectedTemplate);
                }
              }}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="View existing documents"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {expanded && (
        <div className="rounded-xl border border-border bg-muted p-2 space-y-2 max-h-48 overflow-y-auto">
          {documentTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            const hasExisting = existingDocuments.some(doc => doc.templateId === template.id);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelect(template)}
                className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                  isSelected
                    ? "bg-indigo-500/20 border border-indigo-500/30"
                    : "hover:bg-muted"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {hasExisting && (
                    <span className="text-xs text-emerald-400">Saved</span>
                  )}
                  {isSelected && (
                    <span className="text-xs text-indigo-400">Selected</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}