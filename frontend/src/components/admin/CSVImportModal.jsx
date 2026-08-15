import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

const CSVImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const { darkMode } = useTheme();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv") || droppedFile.type === "text/csv") {
        setFile(droppedFile);
        setError("");
        setResult(null);
      } else {
        setError("Only CSV files are supported");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".csv") || selectedFile.type === "text/csv") {
        setFile(selectedFile);
        setError("");
        setResult(null);
      } else {
        setError("Only CSV files are supported");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axiosInstance.post("/skill-relations/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to upload and import CSV file. Please check file format."
      );
      if (err.response?.data?.errors) {
        setResult({
          message: err.response.data.message || "Failed with errors",
          processed: err.response.data.processed || 0,
          created: err.response.data.created || 0,
          skipped: err.response.data.skipped || 0,
          errors: err.response.data.errors,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,fromSkillId,toSkillId,relationship,dependencyType\n" +
      "65a25f9d273a216db8a101d2,65a25f9d273a216db8a101d3,prerequisite,Required\n" +
      "65a25f9d273a216db8a101d4,65a25f9d273a216db8a101d5,related,Optional\n" +
      "65a25f9d273a216db8a101d6,65a25f9d273a216db8a101d7,child,\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "skill_relations_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.96, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 16, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl rounded-[24px] shadow-2xl bg-admin-surface-floating border border-admin-border flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 md:px-8 border-b border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
            <div>
              <h2 className="text-[20px] font-black text-admin-text tracking-tight">Bulk Import Skill Relations</h2>
              <p className="text-[12px] font-medium text-admin-text-muted mt-1">Upload a CSV file containing connections between skills.</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-admin-bg transition-colors text-admin-text-muted hover:text-admin-text border border-transparent hover:border-admin-border"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 md:p-8 flex-1">
            {/* Instructions */}
            <div className="p-5 rounded-[16px] mb-8 bg-admin-primary-light border border-admin-primary/20 text-admin-primary">
              <div className="font-bold text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <span>CSV File Requirements</span>
                <button
                  onClick={downloadTemplate}
                  className="hover:text-admin-primary-hover font-bold underline flex items-center gap-1 transition-colors text-[12px]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template
                </button>
              </div>
              <ul className="list-disc list-inside space-y-2 text-[12px] font-medium">
                <li>Columns: <code className="font-mono bg-admin-bg/50 border border-admin-border/30 px-1.5 py-0.5 rounded text-admin-text">fromSkillId</code>, <code className="font-mono bg-admin-bg/50 border border-admin-border/30 px-1.5 py-0.5 rounded text-admin-text">toSkillId</code>, <code className="font-mono bg-admin-bg/50 border border-admin-border/30 px-1.5 py-0.5 rounded text-admin-text">relationship</code>, <code className="font-mono bg-admin-bg/50 border border-admin-border/30 px-1.5 py-0.5 rounded text-admin-text">dependencyType</code></li>
                <li><code className="font-mono bg-admin-bg/50 border border-admin-border/30 px-1.5 py-0.5 rounded text-admin-text">relationship</code> values: <code className="font-mono text-admin-primary font-bold">parent</code>, <code className="font-mono text-admin-primary font-bold">child</code>, <code className="font-mono text-admin-primary font-bold">prerequisite</code>, <code className="font-mono text-admin-primary font-bold">related</code></li>
                <li><code className="font-mono bg-admin-bg/50 border border-admin-border/30 px-1.5 py-0.5 rounded text-admin-text">dependencyType</code> values: <code className="font-mono text-admin-primary font-bold">Required</code>, <code className="font-mono text-admin-primary font-bold">Recommended</code>, <code className="font-mono text-admin-primary font-bold">Optional</code> (optional/can be left blank)</li>
              </ul>
            </div>

            {/* Error Alert */}
            {error && !result && (
              <div className="p-4 mb-6 text-[13px] font-bold text-admin-danger bg-admin-danger-light rounded-[16px] border border-admin-danger/20">
                {error}
              </div>
            )}

            {/* Drag and Drop Zone */}
            {!result && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[20px] p-8 md:p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                  dragOver
                    ? "bg-admin-primary-light border-admin-primary"
                    : "bg-admin-surface border-admin-border hover:border-admin-primary/50"
                }`}
              >
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="csv-file-input" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  <svg
                    className={`w-14 h-14 mb-4 transition-transform ${dragOver ? "scale-110 text-admin-primary" : "text-admin-text-muted opacity-50"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {file ? (
                    <div>
                      <p className="font-black text-admin-primary text-[15px] mb-1">
                        {file.name}
                      </p>
                      <p className="text-[12px] font-bold text-admin-text-muted uppercase tracking-widest">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-black text-admin-text text-[15px] mb-2">
                        Drag and drop your CSV file here
                      </p>
                      <p className="text-[12px] font-medium text-admin-text-muted">
                        or <span className="text-admin-primary font-bold underline">browse</span> to choose a file (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            )}

            {/* Results view */}
            {result && (
              <div className="space-y-6">
                <h3 className="font-black text-[18px] text-admin-text">
                  {result.created > 0 || result.skipped === 0 ? "🎉 Import Complete!" : "⚠️ Import completed with errors"}
                </h3>
                
                {/* Status cards grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-[16px] border text-center bg-admin-surface border-admin-border/50">
                    <div className="text-[28px] font-black text-admin-primary">{result.processed}</div>
                    <div className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mt-1">Processed</div>
                  </div>
                  <div className="p-4 rounded-[16px] border text-center bg-admin-success-light border-admin-success/20">
                    <div className="text-[28px] font-black text-admin-success">{result.created}</div>
                    <div className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mt-1">Created</div>
                  </div>
                  <div className="p-4 rounded-[16px] border text-center bg-admin-danger-light border-admin-danger/20">
                    <div className="text-[28px] font-black text-admin-danger">{result.skipped}</div>
                    <div className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mt-1">Skipped</div>
                  </div>
                </div>

                {/* Error logs */}
                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[13px] font-bold text-admin-danger">Error Details:</span>
                    <div className="max-h-48 overflow-y-auto border rounded-[16px] p-4 bg-admin-bg border-admin-border">
                      <table className="w-full text-[12px] text-left">
                        <thead>
                          <tr className="border-b border-admin-border/50 text-admin-text-muted">
                            <th className="pb-2 font-bold uppercase tracking-widest w-16">Row</th>
                            <th className="pb-2 font-bold uppercase tracking-widest">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border/50 font-medium">
                          {result.errors.map((err, idx) => (
                            <tr key={idx} className="hover:bg-admin-surface/50 transition-colors">
                              <td className="py-2.5 font-mono text-admin-text-muted">{err.row || "Bulk"}</td>
                              <td className="py-2.5 text-admin-danger">{err.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t border-admin-border/50 bg-admin-surface-floating/90 backdrop-blur-md">
            {!result ? (
              <>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-[13px] font-bold transition-colors bg-admin-bg hover:bg-admin-surface-elevated border border-admin-border text-admin-text"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="px-6 py-3 rounded-xl text-[13px] font-bold text-white transition-colors flex items-center gap-2 bg-admin-primary hover:bg-admin-primary-hover shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Importing...
                    </>
                  ) : (
                    "Start Import"
                  )}
                </motion.button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl text-[13px] font-bold text-white bg-admin-primary hover:bg-admin-primary-hover shadow-md transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CSVImportModal;
