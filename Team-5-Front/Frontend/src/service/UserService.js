// service/UserDataService.js
import api from "./AxiosConfig";

const userService = {
  getUserProfile: async (userName) => {
    const res = await api.get(`/auth/user/${encodeURIComponent(userName)}`);
    return res.data;
  },

  /**
   * Debe coincidir con el backend:
   * PUT /api/auth/update
   * Params: originalUser, newUser, img (multipart/form-data)
   */
  updateUserNameAndImage: async ({ oldName, newName, imageFile }) => {
    const formData = new FormData();
    formData.append("originalUser", oldName); // 👈 nombre exacto
    formData.append("newUser", newName); // 👈 nombre exacto

    // ⚠️ En tu controller 'img' NO es opcional. Si no envías imagen, puede fallar.
    if (imageFile) {
      formData.append("img", imageFile); // 👈 nombre exacto
    } else {
      // Si no quieres forzar imagen, deberías volver opcional 'img' en el backend:
      // @RequestParam(value="img", required=false) MultipartFile img
      // De lo contrario, aquí debes enviar alguna imagen por defecto.
    }

    const res = await api.put(`/auth/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // boolean true
  },
};

export const getUserImage = img => {
  if (!img) return null

  return `${import.meta.env.VITE_IMG_URL}/uploads/users/${img}`
}

export default userService;
