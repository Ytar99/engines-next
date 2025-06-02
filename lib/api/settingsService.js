import apiClient from "./client";

const SettingsService = {
  exportBackup() {
    return apiClient.get("/crm/db/backup", {
      responseType: "blob", // Важно для получения бинарных данных
    });
  },

  importBackup(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/crm/db/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default SettingsService;
