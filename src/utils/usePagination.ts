import { useState } from "react"
import { paginationProps } from "../Pagination";

type paginationState = {
    currentPage: number,
    rowsPerPage: number,
};
type rowsPerPageOptions = number[];

const defaultRowsPerPageOptions = [10, 25, 50, 75, 100];

export const usePagination = (props: Pick<paginationProps, "tableRows" | "totalRows">) => {
    const { tableRows, totalRows } = props;
    const [paginationState, setPaginationState] = useState<paginationState>({
        currentPage: 1,
        rowsPerPage: 10
    });
    const [rowsPerPageOptions, setRowsPerPageOptions] = useState<rowsPerPageOptions>(defaultRowsPerPageOptions);

    // if totalrows is present it is server side pagination.
    const isServerSide = typeof totalRows === "number";

    const pageStartRowNumber =
        Math.max(1,
            ((paginationState.currentPage - 1) * paginationState.rowsPerPage))

    const pageEndRowNumber =
        Math.min(isServerSide
            ? totalRows
            : tableRows.length,
            ((paginationState.currentPage) * paginationState.rowsPerPage))

    const calculatedTotalRows = isServerSide
        ? totalRows
        : tableRows.length;

    const lastPageNumber = Math.max(
        Math.floor(calculatedTotalRows / paginationState.rowsPerPage) +
        Math.min(1, Math.floor((calculatedTotalRows % paginationState.rowsPerPage)))
        , 1);

    /** sorts the new options and then replaces the old options */
    const replaceRowsPerPageOptions = (newOptions: rowsPerPageOptions) => {
        setRowsPerPageOptions(newOptions.sort());
    }

    /** adds and sorts the `RowsPerPageOptions` array */
    const appendRowsPerPageOptions = (additionalOptions: rowsPerPageOptions) => {
        setRowsPerPageOptions((prevOptions) => {
            const uniqueOptions = new Set([...prevOptions, ...additionalOptions]);
            return Array.from(uniqueOptions).sort();
        })
    }

    const updateRowsPerPage = (newRowsPerPage: number) => {
        setPaginationState((prevState) => ({
            ...prevState,
            rowsPerPage: newRowsPerPage,
        }));
    }

    const updateCurrentPage = (newPage: number) => {
        setPaginationState((prevState) => ({
            ...prevState,
            currentPage: newPage,
        }));
    }

    return {
        isServerSide,
        paginationState,
        updateCurrentPage,
        updateRowsPerPage,
        setPaginationState,

        rowsPerPageOptions,
        replaceRowsPerPageOptions,
        appendRowsPerPageOptions,
        lastPageNumber,

        pageStartRowNumber,
        pageEndRowNumber,
    }
}
