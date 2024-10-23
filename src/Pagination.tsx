import React, { cloneElement, ReactElement, useState } from "react";
import PropTypes from "prop-types";
import { useClassNames } from "./utils";
import { parseInt } from "lodash";

type rowPerPageSwitcherProps = {
    options: number[],
    selectedOption: number,
    onChange: (newRowPerPage: number) => void;
}

const RowPerPageSwitcher = (props: rowPerPageSwitcherProps) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [active, setActive] = useState<number>(props.selectedOption || defaultRowsPerPageOptions[0]);

    return <div className="RPP-container">
        <div className="RPP-text"> Rows Per Page:</div>
        <div className="RPP-switch-box" onClick={() => setIsVisible(true)}>
            <span>
                {active}
            </span>
            {'>'}
        </div>

        {isVisible &&
            <div>
                {props.options.map((option, index) => (
                    <div
                        key={`RPP-${index}`}
                        onClick={() => {
                            setIsVisible(false);
                            setActive(option)
                            props.onChange(option);
                        }}
                        className={option === props.selectedOption
                            ? "RPP-selected-option"
                            : "RPP-option"}>
                        {option}
                    </div>
                ))}
            </div>}

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

    const GoToLastPage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === serverResponse.last_page;

        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(serverResponse.last_page);
                onLastPage?.()
            },
            [linkComponent.urlProp]: isDisabled ? null : serverResponse.last_page_url,
            "aria-disabled": isDisabled,
            children: ">>"
        })
    }

    const GoToFirstPage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === 1;
        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(1);
                onFirstPage?.()
            },
            [linkComponent.urlProp]: isDisabled ? null : serverResponse.first_page_url,
            "aria-disabled": isDisabled,
            children: "<<"
        })
    }
    const GoBackOnePage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === 1;
        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(parseInt(currentlyActivePage?.label || "") - 1)
            },
            [linkComponent.urlProp]: isDisabled ? null : serverResponse.prev_page_url,
            "aria-disabled": parseInt(currentlyActivePage?.label || "") === 1,
            children: "<"
        })
    }

    const GoForwardOnePage = () => {
        const isDisabled = parseInt(currentlyActivePage?.label || "") === serverResponse.last_page;
        return cloneElement(linkComponent.element, {
            onClick: () => {
                onPageChange?.(parseInt(currentlyActivePage?.label || "") + 1)
            },
            [linkComponent.urlProp]: isDisabled ? null : serverResponse.next_page_url,
            "aria-disabled": isDisabled,
            children: ">"
        })
    }

    const NumberedSwitcher = () => {
        return <div className={prefix("numbered-switcher")}>
            {serverResponse.links.slice(1, serverResponse.links.length - 1).map((link, index) => {
                const isDisabled = link.active;

                return cloneElement(linkComponent.element, {
                    onClick: () => {
                        onPageChange?.(parseInt(link.label))
                    },
                    [linkComponent.urlProp]: isDisabled ? null : link.url,
                    role: "button",
                    key: `page-${index}`,
                    "aria-disabled": link.active,
                    children: link.label
                })
            })}
        </div>
    }

    return (
        <div className={prefix("container")} >
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

            <div className={prefix("page-switcher")}>
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
