import React, { MouseEvent, memo } from 'react';
import Cell from '../Cell';
import CheckBox from '../utils/checkbox';
import { rowSelectionState, useRowSelection } from '../utils/useRowSelection';

type HeaderCheckbox = {
    isHeaderCell: true;
    currentRowId?: never;
}

type RowCheckbox = {
    isHeaderCell: false;
    currentRowId: string;
}

type TreeParent = {
    hasChildren?: boolean,
    childrenIds?: string[]
    isChild?: never
}

type TreeChild = {
    isChild?: boolean;
    parentId?: string;
    // contains parent's child except itself.
    siblingIds?: string[];
}

type SelectionCheckboxProps = {
    index: number;
    onRowSelect?: (selectionState: rowSelectionState) => void
} & (HeaderCheckbox | RowCheckbox)
    & (TreeParent | TreeChild);

const SelectionCheckbox = memo(({
    isHeaderCell,
    currentRowId,
    index,
    onRowSelect,
    ...otherProps
}: SelectionCheckboxProps) => {
    const { setRowSelection, isIdSelected, rowSelection } = useRowSelection();
    const isRowSelected = isHeaderCell ? false : isIdSelected?.(currentRowId);

    const handleRowSelection = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isHeaderCell) {
            setRowSelection((prevRowSelection) => {
                const newAllSelected = !prevRowSelection.allSelected;
                const updatedState = {
                    selectedRows: [],
                    allSelected: newAllSelected,
                    isInverseSelection: newAllSelected
                }
                onRowSelect?.(updatedState);
                return updatedState;
            });
            return;
        }

        setRowSelection((prevSelectionState: any) => {
            const updatedState = {
                ...prevSelectionState,
                allSelected: false,
                selectedRows:
                    isRowSelected
                        ? prevSelectionState.selectedRows.filter((id: string | number) => id !== currentRowId)
                        : [...prevSelectionState.selectedRows, currentRowId]
            }
            onRowSelect?.(updatedState);
            return updatedState;
        });
    };

    const cellProps = {
        width: 50,
        left: 0,
        className: 'grid place-items-center group',
        onClick: handleRowSelection,
        ...otherProps
    };

    return (
        <Cell {...cellProps}>
            <CheckBox
                active={
                    isHeaderCell
                        ? rowSelection.allSelected
                        : rowSelection.isInverseSelection
                            ? !isRowSelected
                            : (isRowSelected || rowSelection.allSelected)}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                onClick={handleRowSelection}
            />
        </Cell>
    );
});

SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox; 
