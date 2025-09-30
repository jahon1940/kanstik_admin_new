"use client";

import React from "react";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { Button } from "@/components/ui/button";

const AlertDialogExample: React.FC = () => {
  const { showAlert } = useAlertDialog();

  const handleDelete = () => {
    showAlert({
      title: "Удалить элемент?",
      description:
        "Это действие нельзя отменить. Элемент будет удален навсегда.",
      confirmText: "Удалить",
      cancelText: "Отмена",
      variant: "destructive",
      onConfirm: () => {
        console.log("Item deleted!");
        // Your delete logic here
      },
      onCancel: () => {
        console.log("Delete cancelled");
      },
    });
  };

  const handleSave = () => {
    showAlert({
      title: "Сохранить изменения?",
      description: "Вы уверены, что хотите сохранить все изменения?",
      confirmText: "Сохранить",
      cancelText: "Отмена",
      onConfirm: () => {
        console.log("Changes saved!");
        // Your save logic here
      },
      onCancel: () => {
        console.log("Save cancelled");
      },
    });
  };

  return (
    <div className="space-x-4">
      <Button onClick={handleDelete} variant="destructive">
        Удалить
      </Button>
      <Button onClick={handleSave}>Сохранить</Button>
    </div>
  );
};

export default AlertDialogExample;
