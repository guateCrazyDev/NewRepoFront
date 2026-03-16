import api from "./AxiosConfig"; 

const userService = {
  getUserProfile: async (userName) => {
    const response = await api.get(`/auth/user/${userName}`);
    return response.data;
  },

  updateUserProfile: async (originalUser, newUser, imgFile) => {
    const formData = new FormData();
    formData.append("originalUser", originalUser);
    formData.append("newUser", newUser);
    if (imgFile) formData.append("img", imgFile);

   const response = await api.put("/auth/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default userService;
