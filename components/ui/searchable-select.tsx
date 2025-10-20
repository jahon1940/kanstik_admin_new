"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Select from "react-select";
import { useTranslation } from "react-i18next";

interface SearchableSelectProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  className,
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  return (
    <div className={cn("w-full", className)}>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => {
          const selected = Array.isArray(option) ? option[0] : option;
          const nextValue =
            (selected as { value?: string } | null)?.value ?? "";
          onValueChange?.(nextValue);
        }}
        isClearable={false}
        isSearchable={true}
        placeholder={placeholder || t("ui.select_option")}
        noOptionsMessage={() => emptyText || t("ui.nothing_found")}
        classNamePrefix="rs"
        styles={{
          control: (base) => ({ ...base, minHeight: 36 }),
          valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
          indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : undefined
        }
        aria-label={searchPlaceholder || t("ui.search")}
      />
    </div>
  );
}
