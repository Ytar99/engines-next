// components/common/ConfirmationDialog.js
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Подтверждение удаления",
  contentText = "Вы уверены, что хотите выполнить это действие?",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{contentText}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary" variant="outlined">
        {cancelText}
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);
