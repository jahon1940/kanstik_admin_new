import type { SVGProps, FC } from "react";

const MenuIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 7H21"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M3 12H21"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M3 17H21"
        stroke="#9A9A9A"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default MenuIcon;
