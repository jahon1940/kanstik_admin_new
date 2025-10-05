import type { SVGProps, FC } from "react";

const ReportIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.15991 13.6126V12.0601"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M9 13.6126V10.5076"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M12.8401 13.6125V8.94751"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M12.8399 4.3877L12.4949 4.7927C10.5824 7.0277 8.01741 8.6102 5.15991 9.3227"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M10.6426 4.3877H12.8401V6.5777"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default ReportIcon;
