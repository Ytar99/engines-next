import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

// Компонент диалога подтверждения удаления
export const DeleteConfirmationDialog = ({ selectedUser, setSelectedUser, handleConfirmDelete }) => (
  <Dialog open={selectedUser !== null} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
    <DialogTitle>Подтверждение удаления</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Вы уверены, что хотите удалить пользователя {selectedUser?.email}?
        <br />
        Это действие нельзя будет отменить.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setSelectedUser(null)} color="primary" variant="outlined">
        Отмена
      </Button>
      <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
        Удалить
      </Button>
    </DialogActions>
  </Dialog>
);
