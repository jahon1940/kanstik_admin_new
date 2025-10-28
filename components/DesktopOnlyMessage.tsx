import { useTranslation } from "react-i18next";

export default function DesktopOnlyMessage() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg shadow-lg bg-card p-6">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12.7rem)] md:h-[calc(100vh-9rem)] text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t("responsive.desktop_only_message")}
          </h3>
        </div>
      </div>
    </div>
  );
}
