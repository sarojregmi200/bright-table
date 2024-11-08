import React, { createContext, ReactNode, useContext, useState } from "react"

type selectedRows = (Record<string, string[]> | string)[]
export type rowSelectionState = {
    selectedRows: selectedRows
    allSelected: boolean,

    // defines the type of selection 
    // if set to false works as normal selected rows  = selected rows
    // if set to true works inverse selected rows contains the rows that are not selected.
    isInverseSelection?: boolean,
}

export const RowSelectionContext = createContext<{
    rowSelectionState: rowSelectionState,
    setRowSelectionState: React.Dispatch<React.SetStateAction<rowSelectionState>>
}>({
    rowSelectionState: {
        selectedRows: [],
        allSelected: false,
        isInverseSelection: false,
    },
    setRowSelectionState: () => { }
});

export const RowSelectionWrapper = ({ children }: { children: ReactNode }) => {
    const [rowSelectionState, setRowSelectionState] = useState<rowSelectionState>({
        selectedRows: [],
        allSelected: false,
        isInverseSelection: false,
    });

    return (
        <RowSelectionContext.Provider
            value={{
                rowSelectionState: rowSelectionState,
                setRowSelectionState: setRowSelectionState
            }}>
            {children}
        </RowSelectionContext.Provider>)
}

export const useRowSelection = () => {
    const context = useContext(RowSelectionContext);
    if (!context)
        throw new Error("Cannot use row selection context outside it's provider");

    const { rowSelectionState: rowSelection, setRowSelectionState: setRowSelection } = context;

    const getSelectedChilds = (parentId: string): undefined | string[] => {
        // first of all it should be a parent to get it's selected childs.
        const MatchRec = rowSelection.selectedRows.find((selections) => selections[parentId])
        if (!MatchRec || typeof MatchRec === "string") return;

        return MatchRec[parentId];
    }

    const areAllChildSelected = ({
        parentId,
        childrens
    }: {
        parentId: string,
        childrens: string[],
    }): boolean => {
        const MatchRec = rowSelection.selectedRows.find((selections) => selections[parentId])
        if (!MatchRec || typeof MatchRec === "string") return false;

        const selectedChildrens = MatchRec[parentId];

        return childrens.every(child => selectedChildrens.includes(child));
    }

    const isGlobalChecked = () => {
        return rowSelection.allSelected
    }

    const isIdSelected = (queryId: string) => {
        if (!rowSelection.selectedRows.length)
            return false

        return rowSelection?.selectedRows?.some(id => {
            if (typeof id !== "object")
                return id === queryId

            return id?.[0]?.some((child) => {
                return child === queryId
            })
        })
    }

    return {
        rowSelection,
        setRowSelection,
        getSelectedChilds,
        areAllChildSelected,
        isIdSelected,
        isGlobalChecked,
    } as const
}
