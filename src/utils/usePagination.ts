import { paginationProps } from "../Pagination";
import {
    rowsPerPageOptions,
    usePaginationContext
} from "../PaginationContext";

export const usePagination = (props: Pick<paginationProps, "tableRows" | "totalRows">) => {
    const { tableRows, totalRows } = props;
    const {
        rowsPerPageOptions,
        paginationState,
        setPaginationState,
        setRowsPerPageOptions
    } = usePaginationContext();

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
