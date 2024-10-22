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

export interface paginationProps {
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
        totalRows,
        tableRows,
        onAdditionalDataRequest,
        onRowsPerPageChange,
        onLastPage,
        onFirstPage,
        onPageChange
    } = props;

    const {
        paginationState,
        updateRowsPerPage,
        updateCurrentPage,
        /* appendRowsPerPageOptions,
        replaceRowsPerPageOptions, */
        pageStartRowNumber,
        pageEndRowNumber,
        isServerSide,
        rowsPerPageOptions,
        lastPageNumber,
    } = usePagination({
        totalRows,
        tableRows,
    });

    const hasEntireTableLoaded = totalRows === tableRows.length;

    const { prefix } = useClassNames("btp");

    const statusString = `${pageStartRowNumber}-${pageEndRowNumber} of ${isServerSide ? totalRows : tableRows.length}`;

    const handlePageUpdate = (newPageNumber: number) => {
        updateCurrentPage(lastPageNumber);

        if (hasEntireTableLoaded || !totalRows)
            return;

        // TODO: Implement the skip Map for less data load
        let requiredAdditionalRows = 0;

        switch (true) {
            case newPageNumber === 1:
            default:
            case newPageNumber === paginationState.currentPage:
                break;

            case newPageNumber === lastPageNumber: {
                const rowsBeforeLastPage = paginationState.rowsPerPage * (lastPageNumber - 1);
                const overflowRows = Math.max(tableRows.length - rowsBeforeLastPage, 0);

                // getting the  number of rows required in the last page.
                requiredAdditionalRows = paginationState.rowsPerPage - overflowRows;
                break;
            }

            case newPageNumber > paginationState.currentPage: {
                const rowsBeforeNewPage = paginationState.rowsPerPage * (paginationState.currentPage);
                const overflowRows = Math.max(tableRows.length - rowsBeforeNewPage, 0);

                // it means the rows are already fetched and no additional data is required 
                if (overflowRows > paginationState.rowsPerPage)
                    break;

                // it means either there are no overflow rows or there are some below required rows.
                requiredAdditionalRows = Math.min(
                    paginationState.rowsPerPage - overflowRows,
                    paginationState.rowsPerPage);

                break;
            }

            // it has high probably of already being fetched.
            case newPageNumber < paginationState.currentPage: {
                const totalRowWithThisPage = newPageNumber * paginationState.rowsPerPage;
                const areRowFetched = tableRows.length > totalRowWithThisPage;
                if (areRowFetched)
                    break;

                const rowsBeforeNewPage = paginationState.rowsPerPage * (newPageNumber - 1);
                const overflowRows = Math.max(tableRows.length - rowsBeforeNewPage, 0);

                requiredAdditionalRows = Math.min(
                    paginationState.rowsPerPage - overflowRows,
                    paginationState.rowsPerPage
                )
            }
        }

        onAdditionalDataRequest?.(requiredAdditionalRows)
    }

    const GoToLastPage = () => {
        return <button
            onClick={() => {
                handlePageUpdate(lastPageNumber)
                onLastPage?.()
            }}
            disabled={paginationState.currentPage === lastPageNumber}
        >
            {">>"}
        </button>
    }

    const GoToFirstPage = () => {
        return <button
            onClick={() => {
                handlePageUpdate(1)
                onFirstPage?.()
            }}
            disabled={paginationState.currentPage === 1}
        >
            {'<<'}
        </button>
    }

    const GoBackOnePage = () => {
        return <button
            onClick={() => {
                handlePageUpdate(paginationState.currentPage - 1)
                onPageChange?.(paginationState.currentPage - 1)
            }}
            disabled={paginationState.currentPage === 1}
        >
            {'<'}
        </button>
    }

    const GoForwardOnePage = () => {
        return <button
            onClick={() => {
                handlePageUpdate(paginationState.currentPage + 1)
                onPageChange?.(paginationState.currentPage + 1)
            }}
            disabled={paginationState.currentPage === lastPageNumber}
        >
            {'>'}
        </button>
    }

    const NumberedSwitcher = () => {
        return <div className={prefix("numbered-switcher")}>
            {Array.from({ length: lastPageNumber }, (_, index) => {
                const pageNumber = index + 1;
                return <div
                    key={`page-${pageNumber}`}
                    onClick={() => handlePageUpdate(pageNumber)}
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
                    onChange={(newRowPerPage: number) => {
                        updateRowsPerPage(newRowPerPage);
                        onRowsPerPageChange?.(newRowPerPage);
                    }}
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
