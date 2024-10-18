import React, { useState } from "react";
import PropTypes from "prop-types";
import { usePagination } from "./utils/usePagination";
import { RowDataType } from "./@types/common";
import { useClassNames } from "./utils";

type rowPerPageSwitcherProps = {
    options: number[],
    selectedOption: number,
    onChange: (newRowPerPage: number) => void;
}

const RowPerPageSwitcher = (props: rowPerPageSwitcherProps) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    return <div className="RPP-container">
        <div className="RPP-text"> Rows Per Page:</div>
        <div className="RPP-switch-box" onClick={() => setIsVisible(true)}>
            <span>
                {props.selectedOption}
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

export type paginationProps = {
    /** total rows is required for serverside pagination 
     * If not provided the pagination will be client side pagination.
    * */
    totalRows?: number;

    /** Rows that are present in the table */
    tableRows: readonly RowDataType[];

    /** Method that gets called when there is not enough to display data during pagination. */
    onAdditionalDataRequest?: (dataCount: number) => void;

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

const Pagination = (props: paginationProps) => {

    const {
        paginationState,
        updateRowsPerPage,
        updateCurrentPage,
        appendRowsPerPageOptions,
        replaceRowsPerPageOptions,
        pageStartRowNumber,
        pageEndRowNumber,
        isServerSide,
        rowsPerPageOptions,
        lastPageNumber,

    } = usePagination({
        totalRows: props?.totalRows,
        tableRows: props.tableRows
    });

    const { prefix } = useClassNames("btp");

    const statusString = `${pageStartRowNumber}-${pageEndRowNumber} of ${isServerSide ? props.totalRows : props.tableRows.length}`;

    const GoToLastPage = () => {
        return <div onClick={() => { updateCurrentPage(lastPageNumber) }}>
            {">>"}
        </div>
    }

    const GoToFirstPage = () => {
        return <div onClick={() => updateCurrentPage(1)}>
            {'<<'}
        </div>
    }

    const GoBackOnePage = () => {
        return <div onClick={() => updateCurrentPage(paginationState.currentPage - 1)}>
            {'<'}
        </div>
    }

    const GoForwardOnePage = () => {
        return <div onClick={() => updateCurrentPage(paginationState.currentPage + 1)}>
            {'>'}
        </div>
    }

    const NumberedSwitcher = () => {
        return <div className={prefix("numbered-switcher")}>
            {Array.from({ length: lastPageNumber }, (_, index) => {
                const pageNumber = index + 1;
                return <div
                    key={`page-${pageNumber}`}
                    onClick={() => updateCurrentPage(pageNumber)}
                    className={prefix(paginationState.currentPage === pageNumber ? "selected-page" : "page")}>
                    {pageNumber}
                </div>
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
                    onChange={(newRowPerPage: number) => { updateRowsPerPage(newRowPerPage) }}
                    selectedOption={paginationState.rowsPerPage}
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
    onAdditionalDataRequest: PropTypes.func,
}

export default Pagination;
