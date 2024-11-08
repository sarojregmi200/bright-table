import React, { MouseEvent, memo } from 'react';
import Cell from '../Cell';
import CheckBox from '../utils/checkbox';
import { useRowSelection } from '../utils/useRowSelection';

type HeaderCheckbox = {
    isHeaderCell: true;
    currentRowId?: never;
}

type RowCheckbox = {
    isHeaderCell: false;
    currentRowId: string;
}

type SelectionCheckboxProps = {
    index: number;
} & (HeaderCheckbox | RowCheckbox);

const SelectionCheckbox = memo(({
    isHeaderCell,
    currentRowId,
    index,
    ...otherProps
}: SelectionCheckboxProps) => {
    const { setRowSelection, isIdSelected, rowSelection } = useRowSelection();
    const isRowSelected = isHeaderCell ? false : isIdSelected?.(currentRowId);

    const handleRowSelection = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isHeaderCell) {
            const newAllSelected = !rowSelection.allSelected;
            setRowSelection({
                selectedRows: [],
                allSelected: newAllSelected,
                isInverseSelection: newAllSelected
            });
            return;
        }


        setRowSelection((prevSelectionState: any) => ({
            ...prevSelectionState,
            allSelected: false,
            selectedRows:
                isRowSelected
                    ? prevSelectionState.selectedRows.filter((id: string | number) => id !== currentRowId)
                    : [...prevSelectionState.selectedRows, currentRowId]
        }));
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
