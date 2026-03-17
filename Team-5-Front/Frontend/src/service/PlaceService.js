import api from "./AxiosConfig";

export async function chargePlaces(categoryName) {
  const resp = await api.get(`/place/ligth/${encodeURIComponent(categoryName)}`);
  
  return resp.data;
}

export async function createPlaceRequest(categoryData, files,catName) {
  const formData = new FormData();

  formData.append(
    "placeData",
    new Blob([JSON.stringify(categoryData)], { type: "application/json" })
  );
  formData.append("categoryName", catName);

  
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

  const resp = await api.post("/place", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return resp;
}


export async function chargePlaceUnique(placeName) {
  const resp = await api.get(`/place/onlyOne/${encodeURIComponent(placeName)}`);
  return resp.data;
}
