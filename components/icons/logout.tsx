import type { SVGProps, FC } from "react";

const SettingIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
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
        d="M13.08 10.965L15 9.045L13.08 7.125"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.32001 9.04492H14.9475"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.82001 15C5.50501 15 2.82001 12.75 2.82001 9C2.82001 5.25 5.50501 3 8.82001 3"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default SettingIcon;
