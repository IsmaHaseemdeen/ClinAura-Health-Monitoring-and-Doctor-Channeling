import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteDocument,
  getDocumentBlob,
  getDocumentById,
  getMyDocuments
} from "../services/documentService";
import "../App.css";
import "./Patient.css";

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const objectUrlRef = useRef("");

  const clearPreviewUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    setPreviewUrl("");
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await getMyDocuments();
      setDocuments(res.data || []);
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();

    return () => {
      clearPreviewUrl();
    };
  }, []);

  const documentCategories = useMemo(() => {
    const unique = [...new Set(documents.map((doc) => doc.documentCategory).filter(Boolean))];
    return unique.sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    return documents.filter((doc) => {
      const fileName = String(doc.fileName || "").toLowerCase();
      const category = String(doc.documentCategory || "").toLowerCase();
      const notes = String(doc.notes || "").toLowerCase();

      const documentDateValue = doc.documentDate
        ? new Date(doc.documentDate).toISOString().split("T")[0]
        : "";

      const matchesSearch =
        !value ||
        fileName.includes(value) ||
        category.includes(value) ||
        notes.includes(value);

      const matchesType =
        !documentTypeFilter ||
        String(doc.documentCategory || "").toLowerCase() === documentTypeFilter.toLowerCase();

      const matchesStartDate =
        !startDateFilter || (documentDateValue && documentDateValue >= startDateFilter);

      const matchesEndDate =
        !endDateFilter || (documentDateValue && documentDateValue <= endDateFilter);

      return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
    });
  }, [documents, searchTerm, documentTypeFilter, startDateFilter, endDateFilter]);

  const handleSelectDocument = async (id) => {
    try {
      setMessage("");
      setPreviewLoading(true);
      clearPreviewUrl();

      const metadataRes = await getDocumentById(id);
      const blobRes = await getDocumentBlob(id);

      const blob = new Blob([blobRes.data], {
        type: metadataRes.data?.contentType || blobRes.data?.type || "application/octet-stream"
      });

      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;

      setSelectedDocument(metadataRes.data);
      setPreviewUrl(objectUrl);
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to open document.");
      setSelectedDocument(null);
      clearPreviewUrl();
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenFullDocument = async (id) => {
    try {
      setMessage("");

      const metadataRes = await getDocumentById(id);
      const blobRes = await getDocumentBlob(id);

      const blob = new Blob([blobRes.data], {
        type: metadataRes.data?.contentType || blobRes.data?.type || "application/octet-stream"
      });

      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to open full document.");
    }
  };

  const handleDeleteDocument = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");

      const res = await deleteDocument(id);
      setMessage(res.data?.message || "Document deleted successfully.");

      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
        clearPreviewUrl();
      }

      await loadDocuments();
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDocumentTypeFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  return (
    <div className="upload-page">
      <div className="upload-header-card">
        <div>
          <p className="upload-eyebrow">Patient Records Module</p>
          <h2 className="upload-title">My Health Documents</h2>
          <p className="upload-subtitle">
            View your uploaded health records, filter them by name, type, and date range, open them in full, and delete them if needed.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={
            message.toLowerCase().includes("successfully")
              ? "booking-success"
              : "auth-message"
          }
        >
          {message}
        </div>
      )}

      <div className="upload-layout">
        <div className="upload-main-column">
          <div className="upload-card">
            <h3 className="upload-section-title">Uploaded Documents</h3>

            <div className="form-grid two-col" style={{ marginBottom: "16px" }}>
              <div className="full-width">
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Search by Document Name or Notes
                </label>
                <input
                  type="text"
                  placeholder="Search by file name or notes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label>Document Type</label>
                <select
                  value={documentTypeFilter}
                  onChange={(e) => setDocumentTypeFilter(e.target.value)}
                >
                  <option value="">All document types</option>
                  {documentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Document Date From</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>

              <div>
                <label>Document Date To</label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "end" }}>
                <button type="button" className="btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>

            {loading ? (
              <p className="dashboard-subtitle">Loading documents...</p>
            ) : filteredDocuments.length === 0 ? (
              <p className="dashboard-subtitle">No matching documents found.</p>
            ) : (
              <div className="notification-stack">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="notification-card">
                    <strong className="notification-title">{doc.fileName}</strong>
                    <p className="notification-text">
                      Category: {doc.documentCategory || "Other"}
                    </p>
                    <p className="notification-text">
                      Document Date:{" "}
                      {doc.documentDate
                        ? new Date(doc.documentDate).toLocaleDateString()
                        : "-"}
                    </p>
                    <p className="notification-text">
                      Uploaded On:{" "}
                      {doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString()
                        : "-"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "10px"
                      }}
                    >
                      <button
                        className="btn-primary"
                        onClick={() => handleSelectDocument(doc.id)}
                      >
                        View
                      </button>

                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="upload-side-column">
          <div className="upload-card">
            <h3 className="upload-section-title">Document Preview</h3>

            {!selectedDocument ? (
              <p className="dashboard-subtitle">
                Select a document from the list to view it.
              </p>
            ) : previewLoading ? (
              <p className="dashboard-subtitle">Loading preview...</p>
            ) : (
              <div>
                <p><strong>File Name:</strong> {selectedDocument.fileName}</p>
                <p><strong>Category:</strong> {selectedDocument.documentCategory || "-"}</p>
                <p>
                  <strong>Document Date:</strong>{" "}
                  {selectedDocument.documentDate
                    ? new Date(selectedDocument.documentDate).toLocaleDateString()
                    : "-"}
                </p>
                <p><strong>Notes:</strong> {selectedDocument.notes || "-"}</p>

                <div style={{ marginTop: "14px" }}>
                  {selectedDocument.contentType === "application/pdf" ? (
                    <iframe
                      title="Document Preview"
                      src={previewUrl}
                      width="100%"
                      height="500"
                      style={{ border: "1px solid #ddd", borderRadius: "10px" }}
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt={selectedDocument.fileName}
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: "10px"
                      }}
                    />
                  )}
                </div>

                <div style={{ marginTop: "12px" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleOpenFullDocument(selectedDocument.id)}
                  >
                    Open Full Document
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="upload-card">
            <h3 className="upload-section-title">Helpful Guidance</h3>
            <ul className="upload-help-list">
              <li>You can search by file name or notes</li>
              <li>You can filter documents by document type</li>
              <li>You can filter by document date range</li>
              <li>You can open any uploaded document in full view</li>
              <li>Deleting a document removes both the file and its database record</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyDocuments;