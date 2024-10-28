import React, { cloneElement, ReactElement, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useClassNames } from "./utils";
import { Icon } from "./Icons";
import { cn } from "./tailwind/twMerge";
import DirectionAwareContainer from "./utils/directionAwareeContainer";

type rowPerPageSwitcherProps = {
    options: number[],
    selectedOption: number,
    onChange: (newRowPerPage: number) => void;
}

const RowPerPageSwitcher = (props: rowPerPageSwitcherProps) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [active, setActive] = useState<number>(props.selectedOption || defaultRowsPerPageOptions[0]);

    const activatorRef = useRef<HTMLDivElement>(null);

    return <div className="RPP-container flex gap-2 items-center">
        <div className="RPP-text"> Rows Per Page:</div>
        <div
            ref={activatorRef}
            className={cn("RPP-switch-box flex items-center bg-gray-100 rounded-sm px-1 justify-center cursor-pointer",)}
            onClick={() => setIsVisible(true)} >
            <span>
                {active}
            </span>
            <Icon name="arrow_right" className="w-4 rotate-90" />
        </div>

        {isVisible &&
            <DirectionAwareContainer
                direction="top"
                centerAlignContainer
                directionPriority={["top", "right", "left", "bottom"]}
                activatorRef={activatorRef}
                activateWith="ref"
                onOutsideClick={() => {
                    setIsVisible(false);
                }}
                active={isVisible}
                className={"w-12 flex flex-col text-center h-auto bg-white text-gray-600 rounded-sm"}
            >
                {props.options.map((option, index) => (
                    <div
                        key={`RPP-${index}`}
                        onClick={() => {
                            setIsVisible(false);
                            setActive(option)
                            props.onChange(option);
                        }}
                        className={cn(
                            "cursor-pointer hover:bg-gray-200 text-gray-700 rounded-sm",
                            option == props.selectedOption
                                ? "bg-[var(--blue-primary-500)] text-white"
                                : "RPP-option"
                        )}>
                        {option}
                    </div>
                ))}
            </DirectionAwareContainer>}

    </div>
};

export type larvelPaginationObject = {
    first_page_url: string,
    from: number,
    last_page: number,
    last_page_url: string,
    links: {
        url: null | string,
        label: string,
        active: boolean
    }[],
    next_page_url: null | string,
    path: string,
    per_page: number,
    prev_page_url: null | string,
    to: number,
    total: number,
}

export interface paginationProps {
    /** Accepts the larvel pagination response object **/
    serverResponse: larvelPaginationObject | null,

    /** Options to show while switching rowsPerPage */
    rowsPerPageOptions?: rowsPerPageOptions;

    /** Depending on the react framework in use link tags may differ 
     * It makes sure the correct on is used.
     * @default <a href> <a/> is the default tag used.
    * */
    linkComponent?: {
        element: ReactElement,
        urlProp: string,
    };

    /** Method that gets called during page change*/
    onPageChange?: (newPageNumber: number) => void;

    /** Method that gets called when page is set to first page 
     * works only after change meaning, it will not run by default as first page is default.
     * And will only run after page is again set to 1.
    * */
    onFirstPage?: () => void;

    /** Method that gets called when it's the last page */
    onLastPage?: () => void;

    /** Method that gets called when rows per page changes */
    onRowsPerPageChange?: (newRowsPerPage: number) => void;
}

export type rowsPerPageOptions = number[];

export const defaultRowsPerPageOptions = [10, 25, 50, 75, 100];

const Pagination = (props: paginationProps) => {
    const {
        serverResponse,
        onRowsPerPageChange,
        onLastPage,
        onFirstPage,
        onPageChange,
        rowsPerPageOptions = defaultRowsPerPageOptions,
        linkComponent = {
            element: <a></a>,
            urlProp: "href",
        }
    } = props;

    if (!serverResponse)
        return;

    const currentlyActivePage = serverResponse.links.find((link) => link.active);

    const { prefix } = useClassNames("btp");

    const statusString = `${serverResponse.from}-${serverResponse.to} of ${serverResponse.total}`;
    const paginationStyle = {
        btn: "w-6 p-1 border border-gray-200 rounded-sm text-gray-800",
        disabled: "text-gray-400 border-gray-100",
        left: "rotate-180"
    }

    const GoToLastPage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === serverResponse.last_page;

        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(serverResponse.last_page);
                onLastPage?.()
            },
            [linkComponent.urlProp]: isDisabled ? null : `${serverResponse.last_page_url}&per_page=${serverResponse.per_page}`,
            "aria-disabled": isDisabled,
            children: <Icon name="arrow_right_doubled" className={cn(
                paginationStyle.btn,
                isDisabled && paginationStyle.disabled,
            )} />
        })
    }

    const GoToFirstPage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === 1;
        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(1);
                onFirstPage?.()
            },
            [linkComponent.urlProp]: isDisabled ? null : `${serverResponse.first_page_url}&per_page=${serverResponse.per_page}`,
            "aria-disabled": isDisabled,
            children: <Icon
                name="arrow_right_doubled"
                className={cn(
                    paginationStyle.left,
                    paginationStyle.btn,
                    isDisabled && paginationStyle.disabled,
                )}
            />
        })
    }
    const GoBackOnePage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === 1;
        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(parseInt(currentlyActivePage?.label || "") - 1)
            },
            [linkComponent.urlProp]: isDisabled ? null : `${serverResponse.prev_page_url}&per_page=${serverResponse.per_page}`,
            "aria-disabled": parseInt(currentlyActivePage?.label || "") === 1,
            children: <Icon name="arrow_right"
                className={cn(
                    paginationStyle.left,
                    paginationStyle.btn,
                    isDisabled && paginationStyle.disabled,
                )}
            />
        })
    }

    const GoForwardOnePage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === serverResponse.last_page;
        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(parseInt(currentlyActivePage?.label || "") + 1)
            },
            [linkComponent.urlProp]: isDisabled ? null : `${serverResponse.next_page_url}&per_page=${serverResponse.per_page}`,
            "aria-disabled": isDisabled,
            children: <Icon
                name="arrow_right"
                className={cn(
                    paginationStyle.btn,
                    isDisabled && paginationStyle.disabled,
                )}
            />
        })
    }

    const NumberedSwitcher = () => {
        return <div className={cn(prefix("numbered-switcher"), "flex items-center")}>
            {serverResponse.links.slice(1, serverResponse.links.length - 1).map((link, index) => {
                const isDisabled = link.active;

                return cloneElement(linkComponent.element, {
                    onClick: () => {
                        onPageChange?.(parseInt(link.label))
                    },
                    [linkComponent.urlProp]: isDisabled ? null : `${link.url}&per_page=${serverResponse.per_page}`,
                    role: "button",
                    key: `page-${index}`,
                    "aria-disabled": link.active,
                    className: cn("w-6 aspect-square grid place-items-center rounded-sm ",
                        link.label !== "..." && "bg-gray-100",
                        isDisabled && "bg-gray-50 text-gray-400",
                        link.active && "bg-[var(--blue-primary-500)] text-white",
                    ),
                    children: link.label
                })
            })}
        </div>
    }

    return (
        <div className={cn(prefix("container"), "[font-weight:300px] text-[14px] text-gray-600")} >
            <div className={prefix("status")}>
                {statusString}
            </div>

            <div className={prefix("rpp")}>
                <RowPerPageSwitcher
                    onChange={(newRowPerPage: number) => {
                        onRowsPerPageChange?.(newRowPerPage);
                    }}
                    selectedOption={serverResponse.per_page}
                    options={rowsPerPageOptions}
                />
            </div>

            <div className={cn(prefix("page-switcher"), "items-center")}>
                <GoToFirstPage />
                <GoBackOnePage />

                <NumberedSwitcher />

                <GoForwardOnePage />
                <GoToLastPage />
            </div>
        </div>
    )
};

Pagination.displayName = 'Pagination';
Pagination.prototype = {
    totalRows: PropTypes.number,
}

export default Pagination;
