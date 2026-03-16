import api from "./AxiosConfig"; 

export async function createCategoryRequest(categoryData, file) {
  const formData = new FormData();

  formData.append(
    "categoryData",
    new Blob([JSON.stringify(categoryData)], { type: "application/json" })
  );

  formData.append("img", file);

  const resp = await api.post("/category", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  
  console.log(resp);

  return resp;
}

export async function chargeCategories() {
  const resp = await api.get("/category", {});
  
  console.log(resp);

  return resp;
}

export async function chargeCategory(categoryName) {
  const resp = await api.get(`/category/${encodeURIComponent(categoryName)}`);
  
  console.log(resp);

  return resp.data;
}
