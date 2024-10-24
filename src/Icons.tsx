import React, { cloneElement, SVGProps } from "react";

const Icons = {
    arrow_right: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" color="currentColor" fill="none">
        <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeWidth="inherit" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    arrow_right_doubled: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" color="currentColor" fill="none">
        <path d="M12.5 18C12.5 18 18.5 13.5811 18.5 12C18.5 10.4188 12.5 6 12.5 6" stroke="currentColor" strokeWidth="inherit" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.50005 18C5.50005 18 11.5 13.5811 11.5 12C11.5 10.4188 5.5 6 5.5 6" stroke="currentColor" strokeWidth="inherit" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
}

export type Icon = keyof typeof Icons;

type iconProps = { name: Icon } & SVGProps<SVGSVGElement>;

export const Icon = ({ name, ...svgProps }: iconProps) => {
    const CurrentIcon = Icons[name];
    if (!CurrentIcon)
        return <p>
            {name} Icon Not found
        </p>

    return cloneElement(CurrentIcon, svgProps);
}

