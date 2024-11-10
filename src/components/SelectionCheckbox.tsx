import React, { MouseEvent, memo } from 'react';
import Cell from '../Cell';
import CheckBox from '../utils/checkbox';
import { rowSelectionState, useRowSelection } from '../utils/useRowSelection';

export type BaseCheckboxProps = {
    index: number;
    onRowSelect?: (selectionState: rowSelectionState) => void;
}

export type HeaderCheckbox = {
    variant: 'header';
    isHeaderCell: true;
    currentRowId?: never;
} & BaseCheckboxProps

export type NormalRowCheckbox = {
    variant: 'normal';
    currentRowId: string;
} & BaseCheckboxProps

export type TreeTableCheckbox = {
    variant: 'tree';
    isTree: true;
    siblingsIds: string[];
    parentId: string;
    childrenIds: string[];
    currentRowId: string;
} & BaseCheckboxProps

export type SelectionCheckboxProps = HeaderCheckbox | NormalRowCheckbox | TreeTableCheckbox;

const SelectionCheckbox = memo((selectionCheckboxProps: SelectionCheckboxProps) => {
    const { onRowSelect, currentRowId, variant, ...specificProps } = selectionCheckboxProps;

    const {
        handleNormalSelection,
        getRowSelectedStatus,
        handleTreeRowSelection,
        handleHeaderSelection,
    } = useRowSelection();

    const variants = {
        isHeader: variant === 'header',
        isNormal: variant === 'normal',
        isTree: variant === 'tree',
    };

    const handleRowSelection = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (variants.isHeader) {
            handleHeaderSelection({ onRowSelect: onRowSelect })
            return;
        }

        if (variants.isTree) {
            handleTreeRowSelection({
                onRowSelect: onRowSelect,
                treeProps: specificProps as TreeTableCheckbox,
                currentRowId: currentRowId as string,
            })
            return;
        }

        handleNormalSelection({
            currentRowId: currentRowId as string,
            onRowSelect
        })
    };

    const cellProps = {
        width: 50,
        left: 0,
        className: 'grid place-items-center group',
        onClick: handleRowSelection,
    };

    let isChecked = getRowSelectedStatus({
        variants,
        checkboxProps: selectionCheckboxProps
    });

    return (
        <Cell {...cellProps}>
            <CheckBox
                active={isChecked}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                onClick={handleRowSelection}
            />
        </Cell>
    );
});

SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox; 
