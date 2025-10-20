"use client";

import React from "react";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const AlertDialogExample: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const { t } = useTranslation();

  const handleDelete = () => {
    showAlert({
      title: t("alert.delete_title"),
      description: t("alert.delete_description"),
      confirmText: t("alert.delete_confirm"),
      cancelText: t("alert.cancel"),
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
      title: t("alert.save_title"),
      description: t("alert.save_description"),
      confirmText: t("alert.save_confirm"),
      cancelText: t("alert.cancel"),
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
        {t("alert.delete_confirm")}
      </Button>
      <Button onClick={handleSave}>{t("alert.save_confirm")}</Button>
    </div>
  );
};

export default AlertDialogExample;
