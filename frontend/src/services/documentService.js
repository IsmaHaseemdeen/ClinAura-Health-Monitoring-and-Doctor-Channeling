import API from "./api";

/* Uploads a new health report or medical document to the backend */
export const uploadReport = (formData) => {
  return API.post("/documents/upload", formData);
};

/* Retrieves all documents belonging to the logged-in patient */
export const getMyDocuments = () => {
  return API.get("/documents");
};

/* Retrieves the details of a specific document using its document ID */
export const getDocumentById = (id) => {
  return API.get(`/documents/${id}`);
};

/* Retrieves a document file as a blob for secure viewing or download */
export const getDocumentBlob = (id) => {
  return API.get(`/documents/${id}/view`, {
    responseType: "blob"
  });
};

/* Deletes a specific document from the system */
export const deleteDocument = (id) => {
  return API.delete(`/documents/${id}`);
};