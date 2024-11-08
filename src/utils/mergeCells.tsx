import React from 'react';
import { isFunction } from "lodash";
import { get } from "lodash";
import { isNil } from "lodash";
import ColumnGroup from '../ColumnGroup';
import HeaderCell from '../HeaderCell';
import SelectionCheckbox from '../components/SelectionCheckbox';

function cloneCell(Cell, props) {
    return React.cloneElement(Cell, props);
}

const CHECKBOX_WIDTH = 50

function mergeCells(
    cells,
    props: (Record<"shouldRenderCheckbox" | string, any>)
) {
    const nextCells: React.ReactNode[] = [];
    let { shouldRenderCheckbox: shouldRowRenderCheckbox = false, ...additionalProps } = props;

    let checkboxCol = false;

    for (let i = 0; i < cells.length; i += 1) {
        checkboxCol = (i === 0 && shouldRowRenderCheckbox);
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

        const currentRowId = cells[i]?.props?.rowData?.id;

        if (!currentRowId && !isHeaderCell)
            throw new Error("No field with id provided");

        const RowCheckbox = () => (
            isHeaderCell
                ? <SelectionCheckbox
                    isHeaderCell={true}
                    index={i}
                />
                : <SelectionCheckbox
                    index={i}
                    isHeaderCell={false}
                    currentRowId={currentRowId}
                />
        )

        // Add grouping to column headers.
        // header cells
        if (groupCount && isHeaderCell) {
            let nextWidth = width;
            let left = shouldRowRenderCheckbox ? CHECKBOX_WIDTH : 0;
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
            // colSpan cells
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
                checkboxCol && <RowCheckbox key={`checkbox-${currentRowId}-${i}`} />,
                cloneCell(cells[i], {
                    width: nextWidth,
                    left: shouldRowRenderCheckbox
                        ? cells[i].props.left + CHECKBOX_WIDTH
                        : cells[i].props.left,
                    'aria-colspan': nextWidth > width ? colSpan : undefined,
                    ...additionalProps
                })
            );
            continue;
        }

        // normal cell
        nextCells.push(
            checkboxCol && <RowCheckbox key={`checkbox-${currentRowId}-${i}`} />,
            cloneCell(cells[i], {
                left: shouldRowRenderCheckbox
                    ? cells[i]?.props?.left + CHECKBOX_WIDTH
                    : cells[i]?.props?.left,
                ...additionalProps
            }));
    }

    return [
        ...nextCells
    ];
}

export default mergeCells;
