import { RefObject, useEffect } from "react";

type useOutsideClickProps = {
    ref: RefObject<HTMLElement | null>,
    callback: () => void,
    active: boolean,
}

export const useOutsideClick = ({
    ref,
    callback,
    active
}: useOutsideClickProps) => {
    const handleOutsideClick = (e: MouseEvent) => {
        if (ref.current && !(ref.current).contains(e.target as HTMLElement)) {
            callback();
        }
    };

    useEffect(() => {
        if (active)
            setTimeout(() => {
                document.addEventListener("click", handleOutsideClick);
            }, 0);

        return () => document.removeEventListener("click", handleOutsideClick);
    }, [active])
}
