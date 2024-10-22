import React, { ReactNode, useContext } from "react";
import { createContext, Dispatch, SetStateAction, useState } from "react";

export type paginationState = {
    currentPage: number,
    rowsPerPage: number,
};
export type rowsPerPageOptions = number[];

export type PaginationContext = {
    paginationState: paginationState;
    setPaginationState: Dispatch<SetStateAction<paginationState>>;
    rowsPerPageOptions: rowsPerPageOptions;
    setRowsPerPageOptions: Dispatch<SetStateAction<rowsPerPageOptions>>;
};

const defaultRowsPerPageOptions = [10, 25, 50, 75, 100];
const PaginationContext = createContext<PaginationContext | null>(null);

const PaginationContextWrapper = ({ children }: { children: ReactNode }) => {
    const [paginationState, setPaginationState] = useState<paginationState>({
        currentPage: 1,
        rowsPerPage: 10
    });

    const [rowsPerPageOptions, setRowsPerPageOptions] = useState<rowsPerPageOptions>(defaultRowsPerPageOptions);

    return <PaginationContext.Provider value={{
        paginationState,
        setPaginationState,
        rowsPerPageOptions,
        setRowsPerPageOptions
    }}>
        {children}
    </PaginationContext.Provider>
}

const usePaginationContext = () => {
    const context = useContext(PaginationContext);

    if (!context)
        throw new Error("Cannot use Pagination Context outside Pagination Wrapper");

    return { ...context }
}

export {
    PaginationContextWrapper,
    PaginationContext,
    usePaginationContext
};
