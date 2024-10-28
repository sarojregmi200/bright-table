import React from 'react';
import { isFunction } from "lodash";
import { get } from "lodash";
import { isNil } from "lodash";
import ColumnGroup from '../ColumnGroup';
import HeaderCell from '../HeaderCell';
import CheckBox from './checkbox';
import Cell from '../Cell';

function cloneCell(Cell, props) {
    return React.cloneElement(Cell, props);
}

function mergeCells(cells, additionalProps?: Record<string, any>) {
    const nextCells: React.ReactNode[] = [];
    let shouldRenderCheckbox = false;

    for (let i = 0; i < cells.length; i += 1) {
        shouldRenderCheckbox = i === 0 && (additionalProps?.shouldRenderCheckbox || false);
        const {
            width,
            colSpan,
            groupCount,
            groupHeader,
            groupAlign,
            groupVerticalAlign,
            isHeaderCell,
            headerHeight,
            groupHeaderHeight,
        } = cells[i].props;

        const groupChildren: React.ReactNode[] = [];

        // Add grouping to column headers.
        if (groupCount && isHeaderCell) {
            let nextWidth = width;
            let left = shouldRenderCheckbox ? 50 : 0;
            for (let j = 0; j < groupCount; j += 1) {
                const nextCell = cells[i + j];
                const {
                    width: nextCellWidth,
                    sortable,
                    children,
                    dataKey,
                    onSortColumn,
                    sortColumn,
                    sortType,
                    align,
                    verticalAlign,
                    renderSortIcon
                } = nextCell.props;

                if (j !== 0) {
                    nextWidth += nextCellWidth;
                    left += cells[i + j - 1].props.width;
                    cells[i + j] = cloneCell(nextCell, { removed: true, ...additionalProps });
                }

                groupChildren.push(
                    <HeaderCell
                        key={j}
                        left={left}
                        align={align}
                        verticalAlign={verticalAlign}
                        dataKey={dataKey}
                        width={nextCellWidth}
                        sortable={sortable}
                        sortColumn={sortColumn}
                        sortType={sortType}
                        onSortColumn={onSortColumn}
                        renderSortIcon={renderSortIcon}
                        {...additionalProps}
                    >
                        {children}
                    </HeaderCell>
                );
            }

            nextCells.push(
                shouldRenderCheckbox && cloneCell(
                    <HeaderCell
                        width={50}
                        left={0}
                        className='grid place-items-center group'>
                        <CheckBox
                            active={false}
                            className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                            onClick={() => { }} />
                    </HeaderCell>,
                    { ...additionalProps }),
                cloneCell(cells[i], {
                    width: nextWidth,
                    children: (
                        <ColumnGroup
                            width={nextWidth}
                            headerHeight={headerHeight}
                            header={groupHeader}
                            align={groupAlign}
                            verticalAlign={groupVerticalAlign}
                            groupHeaderHeight={groupHeaderHeight}
                            {...additionalProps}
                        >
                            {groupChildren}
                        </ColumnGroup>
                    )
                })
            );
            continue;
        } else if (colSpan) {
            // If there is a colSpan attribute, go to its next Cell.
            // Determine whether the value is null or undefined, then merge this cell.

            let nextWidth = width;
            for (let j = 0; j < colSpan; j += 1) {
                const nextCell = cells[i + j];
                if (nextCell) {
                    const {
                        rowData,
                        rowIndex,
                        children,
                        width: colSpanWidth,
                        isHeaderCell,
                        dataKey
                    } = nextCell.props;

                    const cellText = isFunction(children)
                        ? children(rowData, rowIndex)
                        : get(rowData, dataKey);

                    if ((rowData && isNil(cellText)) || (isHeaderCell && isNil(children))) {
                        nextWidth += colSpanWidth;
                        cells[i + j] = cloneCell(nextCell, {
                            removed: true,
                            ...additionalProps
                        });
                    }
                }
            }

            nextCells.push(
                shouldRenderCheckbox && cloneCell(
                    <Cell
                        width={50}
                        left={0}
                        className='grid place-items-center group'>
                        <CheckBox
                            active={false}
                            className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                            onClick={() => { }} />
                    </Cell>,
                    { ...additionalProps }),
                cloneCell(cells[i], {
                    width: nextWidth,
                    left: cells[i].props.left + 50,
                    'aria-colspan': nextWidth > width ? colSpan : undefined,
                    ...additionalProps
                })
            );
            continue;
        }

        nextCells.push(
            shouldRenderCheckbox && cloneCell(
                <Cell
                    width={50}
                    left={0}
                    className='grid place-items-center group'>
                    <CheckBox
                        active={false}
                        className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                        onClick={() => { }} />
                </Cell>,
                { ...additionalProps }),
            cloneCell(cells[i], {
                left: shouldRenderCheckbox ? cells[i]?.props?.left + 50 : cells[i]?.props?.left,
                ...additionalProps
            }));
    }

    return [
        ...nextCells
    ];
}

export default mergeCells;
