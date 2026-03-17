import api from "./AxiosConfig";


export async function createCommentRequest(commentData, files,placeName,userName) {
  const formData = new FormData();

  formData.append(
    "commentData",
    new Blob([JSON.stringify(commentData)], { type: "application/json" })
  );
  formData.append("userName", userName);
  formData.append("placeName", placeName);

  
    if (Array.isArray(files)) {
        if (files.length === 0) {
        throw new Error("At least one file is required");
        }
        files.forEach((f) => formData.append("files", f));
    } else if (files instanceof File) {
        formData.append("files", files);
    } else {
        throw new Error("`files` must be a File or an array of File");
    }

  const resp = await api.post("/comment", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return resp;
}