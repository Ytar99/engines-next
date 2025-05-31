/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button, Box, Typography, Alert, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const DEFAULT_MIN_RESOLUTION = { width: 100, height: 100 };
const DEFAULT_MAX_RESOLUTION = { width: 4096, height: 4096 };
const DEFAULT_ASPECT = 1;
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_OUTPUT_RESOLUTION = { width: 400, height: 400 };

export const ImageUploadWithCrop = ({
  onUpload,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  minResolution = DEFAULT_MIN_RESOLUTION,
  maxResolution = DEFAULT_MAX_RESOLUTION,
  aspect = DEFAULT_ASPECT,
  outputType = "image/jpeg",
  outputQuality = 0.9,
  outputResolution = DEFAULT_OUTPUT_RESOLUTION,
}) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [minCropSize, setMinCropSize] = useState(minResolution);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  const dragCounter = useRef(0);

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  // Добавляем обработчики событий для Drag and Drop
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e) => {
      preventDefaults(e);
      dragCounter.current += 1;
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      preventDefaults(e);
      dragCounter.current -= 1;

      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      preventDefaults(e);
      if (!isDragging) setIsDragging(true);
    };

    const handleDrop = (e) => {
      preventDefaults(e);
      setIsDragging(false);
      dragCounter.current = 0;

      const dt = e.dataTransfer;
      const files = dt.files;

      if (files && files.length > 0) {
        const file = files[0];
        validateFile(file);
      }
    };

    dropArea.addEventListener("dragenter", handleDragEnter);
    dropArea.addEventListener("dragover", preventDefaults);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragenter", handleDragEnter);
      dropArea.removeEventListener("dragover", preventDefaults);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateFile(file);
    }
  };

  const validateFile = (file) => {
    setError(null);

    if (!allowedFileTypes.includes(file.type)) {
      setError(`Неподдерживаемый формат. Разрешены: ${allowedFileTypes.join(", ")}`);
      return;
    }

    if (file.size > maxFileSize) {
      const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      setError(`Файл слишком большой. Максимум: ${sizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minResolution.width || img.height < minResolution.height) {
          setError(
            `Минимальное разрешение: ${minResolution.width}x${minResolution.height}px. 
             Ваше: ${img.width}x${img.height}px`
          );
          return;
        }

        if (img.width > maxResolution.width || img.height > maxResolution.height) {
          setError(
            `Максимальное разрешение: ${maxResolution.width}x${maxResolution.height}px. 
             Ваше: ${img.width}x${img.height}px`
          );
          return;
        }

        setSrc(URL.createObjectURL(file));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = (img) => {
    imgRef.current = img;

    // Рассчитываем минимальный размер кропа для превью
    const scale = Math.min(img.width / img.naturalWidth, img.height / img.naturalHeight);
    const minWidth = minResolution.width * scale;
    const minHeight = minResolution.height * scale;
    setMinCropSize({ width: minWidth, height: minHeight });

    // Автоматический кроп по центру
    const minSide = Math.min(img.width, img.height);
    const cropSize = Math.max(Math.min(minSide, img.width * 0.8), minWidth);

    const initialCrop = {
      unit: "px",
      width: cropSize,
      height: cropSize,
      x: (img.width - cropSize) / 2,
      y: (img.height - cropSize) / 2,
      aspect,
    };

    setCrop(initialCrop);
    // Устанавливаем completedCrop сразу, чтобы кнопка была активна
    setCompletedCrop(initialCrop);
  };

  const handleCropChange = (newCrop) => {
    // Гарантируем, что кроп не меньше минимального размера
    const minWidth = minCropSize.width || minResolution.width;
    const minHeight = minCropSize.height || minResolution.height;

    const cropObj = {
      ...newCrop,
      width: Math.max(newCrop.width || 0, minWidth),
      height: Math.max(newCrop.height || 0, minHeight),
    };

    setCrop(cropObj);
  };

  const handleCropComplete = (c) => {
    setCompletedCrop(c);
  };

  const generateCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return;

    setLoading(true);
    try {
      const blob = await getCroppedImage(imgRef.current, completedCrop, outputType, outputQuality);
      setCroppedBlob(blob);
    } catch (err) {
      setError("Ошибка при обрезке изображения");
    } finally {
      setLoading(false);
    }
  };

  const getCroppedImage = (image, crop, type, quality) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Устанавливаем выходное разрешение
    canvas.width = outputResolution.width;
    canvas.height = outputResolution.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not found");

    // Рассчитываем соотношение для масштабирования
    const scaleWidth = outputResolution.width / (crop.width * scaleX);
    const scaleHeight = outputResolution.height / (crop.height * scaleY);
    const scale = Math.min(scaleWidth, scaleHeight);

    // Рассчитываем смещение для центрирования
    const offsetX = (outputResolution.width - crop.width * scaleX * scale) / 2;
    const offsetY = (outputResolution.height - crop.height * scaleY * scale) / 2;

    // Рисуем изображение с масштабированием и центрированием
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      offsetX,
      offsetY,
      crop.width * scaleX * scale,
      crop.height * scaleY * scale
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Failed to create blob");
          resolve(blob);
        },
        type,
        quality
      );
    });
  };

  const handleUpload = () => {
    if (croppedBlob) {
      onUpload(croppedBlob, handleReset);
    }
  };

  const handleReset = () => {
    setSrc(null);
    setCroppedBlob(null);
    setCompletedCrop(null);
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    dragCounter.current = 0;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <input
        type="file"
        accept={allowedFileTypes.join(",")}
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
        id="image-upload-input"
      />

      <Box
        ref={dropAreaRef}
        sx={{
          display: src || croppedBlob ? "none" : "block", // Основное исправление
          border: isDragging ? "2px solid #2196f3" : "2px dashed #ccc",
          backgroundColor: isDragging ? "rgba(33, 150, 243, 0.1)" : "transparent",
          borderRadius: 1,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={() => document.getElementById("image-upload-input")?.click()}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 60,
            color: isDragging ? "#2196f3" : "text.secondary",
            transition: "color 0.3s ease",
          }}
        />
        <Typography variant="h6" gutterBottom sx={{ color: isDragging ? "#2196f3" : "inherit" }}>
          {isDragging ? "Отпустите файл" : "Перетащите или загрузите изображение"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Разрешенные форматы: {allowedFileTypes.join(", ")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Максимальный размер: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Минимальное разрешение: {minResolution.width}x{minResolution.height}px
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Выходное разрешение: {outputResolution.width}x{outputResolution.height}px
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Выбрать файл
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {src && !croppedBlob && (
        <Box>
          <ReactCrop
            crop={crop}
            onChange={handleCropChange}
            onComplete={handleCropComplete}
            aspect={aspect}
            minWidth={minCropSize.width || 0}
            minHeight={minCropSize.height || 0}
            keepSelection={true}
            restrictPosition={true}
            style={{ cursor: "default" }}
          >
            <img
              alt="Crop preview"
              ref={imgRef}
              src={src}
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                objectFit: "contain",
              }}
              onLoad={(e) => handleImageLoad(e.currentTarget)}
            />
          </ReactCrop>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateCroppedImage}
              disabled={!completedCrop || loading}
            >
              {loading ? <CircularProgress size={24} /> : "Обрезать"}
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Отмена
            </Button>
          </Box>
        </Box>
      )}

      {croppedBlob && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Результат обрезки ({outputResolution.width}x{outputResolution.height}px):
          </Typography>
          <Box
            component="img"
            src={URL.createObjectURL(croppedBlob)}
            alt="Cropped preview"
            sx={{
              maxWidth: "100%",
              maxHeight: 300,
              display: "block",
              mb: 2,
              objectFit: "contain",
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="success" onClick={handleUpload}>
              Загрузить на сервер
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Выбрать другое фото
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
