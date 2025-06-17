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

  getAuditLogs(params) {
    return apiClient.get(
      "/crm/audit/logs",
      { params },
      { headers: { "x-log-secret": process.env.LOG_SECRET || "default-secret" } }
    );
  },
};

export default SettingsService;
