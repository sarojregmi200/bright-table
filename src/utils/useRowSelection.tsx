import React, { createContext, useContext, useState } from "react"

type rowSelectionState = (Record<string, string[]> | string)[]

const RowSelectionContext = createContext<{
    rowSelection: rowSelectionState,
    setRowSelection: React.Dispatch<React.SetStateAction<rowSelectionState>>
} | null>(null);

export const RowSelectionWrapper = ({ children }: { children: React.ReactNode }) => {
    const [rowSelection, setRowSelection] = useState<rowSelectionState>([]);
    return <RowSelectionContext.Provider value={{
        rowSelection, setRowSelection
    }}>
        {children}
    </RowSelectionContext.Provider>
}

export const useRowSelection = () => {
    const context = useContext(RowSelectionContext);
    if (!context)
        throw new Error("Cannot use row selection context outside it's provider");

    const { rowSelection, setRowSelection } = context;

    const getSelectedChilds = (parentId: string): undefined | string[] => {
        // first of all it should be a parent to get it's selected childs.
        const MatchRec = rowSelection.find((selections) => selections[parentId])
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

        const MatchRec = rowSelection.find((selections) => selections[parentId])
        if (!MatchRec || typeof MatchRec === "string") return false;

        const selectedChildrens = MatchRec[parentId];

        return childrens.every(child => selectedChildrens.includes(child));
    }

    const isIdSelected = (queryId: string) => {
        return rowSelection.some(id => {
            if (typeof id === "string")
                return id === queryId

            return id[0].some((child) => {
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
    } as const
}
