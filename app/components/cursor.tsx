"use client";
import React from "react";

export const CCursor = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div
      ref={ref} // ref direkt bu div'e
      className="c-cursor fixed pointer-events-none z-[9999] top-0 left-0"
      style={{
        display: "block",
        width: "44px",
        height: "44px",
        transform: "translate3d(0,0,0)",
        transition: "transform 0.05s ease-out",
      }}
    >
      <i>
        <b>
          <p></p>
        </b>
        <svg
          height="44"
          viewBox="0 0 44 44"
          width="44"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cursor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7A5FFF">
                <animate
                  attributeName="stop-color"
                  values="#FC6666; #FFAFA0; #FFC55C; #FEE56D; #ADED82; #7BDBEC; #8282E9; #FC6666"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#7A5FFF">
                <animate
                  attributeName="stop-color"
                  values="#8282E9; #FC6666; #FFAFA0; #FFC55C; #FEE56D; #ADED82; #7BDBEC; #8282E9;"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#7A5FFF">
                <animate
                  attributeName="stop-color"
                  values="#7BDBEC; #8282E9; #FC6666; #FFAFA0; #FFC55C; #FEE56D; #ADED82; #7BDBEC;"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>
          <path
            fill="url(#cursor-gradient)"
            d="m36 0h-36v36h8v-22l30 30 6-6-30-30h22z"
            fillRule="evenodd"
          />
        </svg>
      </i>
    </div>
  );
});

CCursor.displayName = "CCursor";
