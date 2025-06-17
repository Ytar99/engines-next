import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Input,
  FormControl,
  FormLabel,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import CrmLayout from "@/components/layouts/CrmLayout";
import SettingsService from "@/lib/api/settingsService";
import AuditLogTable from "@/components/crm/AuditLogTable";

export default function SettingsPage() {
  const [file, setFile] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await SettingsService.exportBackup();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "backup.zip");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Экспорт данных успешно завершен");
    } catch (error) {
      toast.error(`Ошибка экспорта: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      toast.warning("Выберите файл для импорта");
      return;
    }

    setIsImporting(true);
    try {
      await SettingsService.importBackup(file);
      toast.success("Импорт данных успешно завершен");
    } catch (error) {
      toast.error(`Ошибка импорта: ${error.message}`);
    } finally {
      setIsImporting(false);
      setFile(null);
    }
  };

  return (
    <CrmLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Настройки системы
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <CloudDownloadIcon sx={{ mr: 1 }} /> Экспорт данных
                </Typography>
                <Typography variant="body1" paragraph>
                  Создайте резервную копию всей системы, включая базу данных и изображения. Архив будет скачан в формате
                  ZIP.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleExport}
                  disabled={isExporting}
                  startIcon={isExporting ? <CircularProgress size={20} /> : null}
                >
                  {isExporting ? "Экспортируется..." : "Экспортировать данные"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <CloudUploadIcon sx={{ mr: 1 }} /> Импорт данных
                </Typography>
                <Typography variant="body1" paragraph>
                  Восстановите систему из резервной копии. Внимание: все текущие данные будут заменены.
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <FormLabel>Выберите файл резервной копии (ZIP)</FormLabel>
                  <Input
                    type="file"
                    inputProps={{ accept: ".zip" }}
                    onChange={handleFileChange}
                    disabled={isImporting}
                  />
                </FormControl>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleImport}
                  disabled={isImporting || !file}
                  startIcon={isImporting ? <CircularProgress size={20} /> : null}
                >
                  {isImporting ? "Импортируется..." : "Импортировать данные"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Используем вынесенный компонент журнала аудита */}
          <Grid item xs={12}>
            <AuditLogTable />
          </Grid>
        </Grid>
      </Box>
    </CrmLayout>
  );
}

export const getServerSideProps = async (context) => {
  return {
    props: {},
  };
};
