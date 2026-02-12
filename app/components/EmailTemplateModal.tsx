"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import type { EmailTemplate } from "@/app/lib/types";

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
  customerName: string;
}

export default function EmailTemplateModal({
  isOpen,
  onClose,
  template,
  customerName,
}: EmailTemplateModalProps) {
  const [copied, setCopied] = useState(false);
  const [editedSubject, setEditedSubject] = useState(template.subject);
  const [editedBody, setEditedBody] = useState(template.body);

  // Reset edited content when template changes
  useEffect(() => {
    setEditedSubject(template.subject);
    setEditedBody(template.body);
  }, [template]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${editedSubject}\n\n${editedBody}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getModalTitle = () => {
    switch (template.type) {
      case "check-in":
        return `Schedule Check-in with ${customerName}`;
      case "upgrade":
        return `Suggest Upgrade to ${customerName}`;
      case "feature-demo":
        return `Send Feature Demo to ${customerName}`;
      default:
        return "Email Template";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      <div className="space-y-4">
        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject (editable)
          </label>
          <input
            type="text"
            value={editedSubject}
            onChange={(e) => setEditedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            placeholder="Email subject..."
          />
        </div>

        {/* Email Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body (editable)
          </label>
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 font-sans resize-y"
            placeholder="Email content..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleCopy}
            className={`flex-1 ${
              copied
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2`}
          >
            {copied ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Edited Template
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded transition-colors"
          >
            Close
          </button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center pt-2">
          Edit the template as needed, then click &quot;Copy Edited Template&quot; to copy it to your clipboard.
        </p>
      </div>
    </Modal>
  );
}
