"use client";

import React from "react";
import Select, { StylesConfig, SingleValue } from "react-select";
import { useLanguage } from "@/contexts/LanguageContext";

// Tipni shu yerda e’lon qilamiz
type OptionType = {
  value: "uz" | "ru";
  label: string;
  flag: string;
};

const LanguageSelect = () => {
  const { language, setLanguage } = useLanguage();

  const options: OptionType[] = [
    { value: "uz", label: "UZ", flag: "🇺🇿" },
    { value: "ru", label: "RU", flag: "🇷🇺" },
  ];

  const customStyles: StylesConfig<OptionType, false> = {
    control: (provided) => ({
      ...provided,
      border: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
      minHeight: "auto",
      cursor: "pointer",
      "&:hover": { border: "none" },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0",
      minHeight: "auto",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0",
      color: "#6B7280",
      "&:hover": { color: "#6B7280" },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "white",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      marginTop: "4px",
      right: "0px",
      zIndex: 9999,
      minWidth: "120px",
      width: "auto",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "8px",
      maxHeight: "none",
      overflow: "visible",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#EBF8FF" : "white",
      color: state.isSelected ? "#2563EB" : "#374151",
      borderRadius: "6px",
      padding: "12px 16px",
      margin: "2px 0",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
      fontWeight: state.isSelected ? "600" : "500",
      minHeight: "44px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#EBF8FF" : "#F3F4F6",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
      fontSize: "18px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
    }),
  };

  const formatOptionLabel = (option: OptionType) => (
    <div className="flex items-center space-x-3">
      <span className="text-xl">{option.flag}</span>
      <span className="font-medium">{option.label}</span>
    </div>
  );

  const currentOption = options.find((option) => option.value === language);

  return (
    <div className="flex items-center justify-end space-x-2 ">
      <Select
        value={currentOption}
        onChange={(option: SingleValue<OptionType>) => {
          if (option) setLanguage(option.value);
        }}
        options={options}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        isSearchable={false}
        components={{
          DropdownIndicator: () => (
            <div className="text-black">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <path d="M6 8L2 4h8l-4 4z" />
              </svg>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default LanguageSelect;
