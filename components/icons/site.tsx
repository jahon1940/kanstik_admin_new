import type { SVGProps, FC } from "react";

const SiteIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
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
        d="M7.5 12.7125H4.6575C2.13 12.7125 1.5 12.0825 1.5 9.555V5.055C1.5 2.5275 2.13 1.8975 4.6575 1.8975H12.555C15.0825 1.8975 15.7125 2.5275 15.7125 5.055"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.5 16.1025V12.7125"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M1.5 9.7125H7.5"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.05493 16.1025H7.49993"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16.5 9.6V13.8825C16.5 15.66 16.0575 16.1025 14.28 16.1025H11.6175C9.83996 16.1025 9.39746 15.66 9.39746 13.8825V9.6C9.39746 7.8225 9.83996 7.38 11.6175 7.38H14.28C16.0575 7.38 16.5 7.8225 16.5 9.6Z"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.9334 13.6875H12.9401"
        stroke="#9A9A9A"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default SiteIcon;
