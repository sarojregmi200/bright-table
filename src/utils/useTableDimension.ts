import React, { useRef, useCallback, useMemo } from 'react';
import getWidth from 'dom-lib/esm/getWidth.js';
import getHeight from 'dom-lib/esm/getHeight.js';
import getOffset from 'dom-lib/esm/getOffset.js';
import { SCROLLBAR_WIDTH } from '../constants';
import { ResizeObserver } from '@juggle/resize-observer';
import useMount from './useMount';
import useUpdateLayoutEffect from './useUpdateLayoutEffect';
import useIntersectionObserver from './useIntersectionObserver';
import isNumberOrTrue from './isNumberOrTrue';
import { RowDataType, ElementOffset } from '../@types/common';
import { debounce } from "lodash";

interface TableDimensionProps<Row, Key> {
    data?: readonly Row[];
    rowHeight: number | ((rowData?: Row) => number);
    height: number;
    minHeight: number;
    maxHeight?: number;
    tableRef?: React.RefObject<HTMLDivElement>;
    headerWrapperRef?: React.RefObject<HTMLDivElement>;
    width?: number;
    prefix: (str: string) => string;
    affixHeader?: boolean | number;
    affixHorizontalScrollbar?: boolean | number;
    headerHeight: number;
    autoHeight?: boolean;
    fillHeight?: boolean;
    children?: React.ReactNode;
    expandedRowKeys?: readonly Key[];
    showHeader?: boolean;
    bordered?: boolean;
    onTableScroll?: (coord: { x?: number; y?: number }) => void;
    onTableResizeChange?: (
        prevSize: number,
        event: 'bodyHeightChanged' | 'bodyWidthChanged' | 'widthChanged' | 'heightChanged'
    ) => void;

    // additional height/width may be added if present.
    hasRowSelection?: boolean;
    hasPagination?: boolean;
}

// 2px is for the border to be display; 
export const PAGINATION_HEIGHT = 64 + 2;
export const ROW_SELECTION_COL_WIDTH = 50 + 2;

/**
 * The dimension information of the table,
 * including the height, width, scrollable distance and the coordinates of the scroll handle, etc.
 * @param props
 * @returns
 */
const useTableDimension = <Row extends RowDataType, Key>(props: TableDimensionProps<Row, Key>) => {
    const {
        data,
        rowHeight,
        tableRef,
        headerWrapperRef,
        prefix,
        width,
        height,
        affixHeader,
        affixHorizontalScrollbar,
        headerHeight,
        autoHeight: autoHeightProp,
        minHeight,
        maxHeight,
        fillHeight,
        children,
        expandedRowKeys,
        showHeader,
        bordered,
        onTableResizeChange,
        onTableScroll,
        hasPagination,
    } = props;

    // accounting for table top height.
    const tableNavContainer = document.querySelector("#bt-table-top-nav");
    const tableNavHeight = tableNavContainer && tableNavContainer.getBoundingClientRect().height || 0;

    const contentHeight = useRef(0);
    const contentWidth = useRef(0);
    const minScrollY = useRef(0);
    const scrollY = useRef(0);
    const scrollX = useRef(0);
    const minScrollX = useRef(0);
    const tableWidth = useRef(width || 0);
    const tableHeight = useRef(height - tableNavHeight || 0);
    const columnCount = useRef(0);
    const resizeObserver = useRef<ResizeObserver>();
    const containerResizeObserver = useRef<ResizeObserver>();
    const headerOffset = useRef<ElementOffset | null>(null);
    const tableOffset = useRef<ElementOffset | null>(null);

    const autoHeight = useMemo(() => autoHeightProp && !maxHeight, [autoHeightProp, maxHeight]);

    const getRowHeight = useCallback(
        (rowData?: Row) => {
            return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
        },
        [rowHeight]
    );

    const calculateTableContextHeight = useCallback(() => {
        const prevContentHeight = contentHeight.current;
        const table = tableRef?.current as HTMLDivElement;
        const rows = table?.querySelectorAll(`.${prefix?.('row')}`) || [];
        const virtualized = table?.querySelectorAll('.virtualized')?.length > 0;

        let nextContentHeight = rows.length
            ? (
                Array.from(rows).map(
                    (row: Element, index: number) => {
                        return getHeight(row) || getRowHeight(data?.[index])
                    }
                ) as number[]
            ).reduce((x: number, y: number) => x + y)
            : 0;

        // After setting the affixHeader property, the height of the two headers should be subtracted.
        contentHeight.current = Math.round(
            nextContentHeight - (affixHeader ? headerHeight * 2 : 0)
        );

        // Whether to show the horizontal scroll bar
        const hasHorizontalScrollbar = contentWidth.current > tableWidth.current;

        const height = fillHeight ? tableHeight.current : Math.max(props.height, maxHeight || 0);
        let tableBodyHeight = height;


        if (!autoHeight) {
            /**
             *  The purpose of subtracting SCROLLBAR_WIDTH is to keep the scroll bar from blocking the content part.
             *  But it will only be calculated when there is a horizontal scroll bar (contentWidth > tableWidth).
             */
            minScrollY.current =
                -(nextContentHeight - height)
                - (hasHorizontalScrollbar ? SCROLLBAR_WIDTH : 0)
                - (hasPagination ? PAGINATION_HEIGHT : 0);
        }

        // If the height of the content area is less than the height of the table, the vertical scroll bar is reset.
        if (nextContentHeight < height) {
            onTableScroll?.({ y: 0 });
        }

        const currentScrollTop = Math.abs(scrollY.current);

        // When Table is set to virtualized, the logic will be entered every time the wheel event is
        // triggered to avoid resetting the scroll bar after scrolling to the bottom, so add the SCROLLBAR_WIDTH value.
        const maxScrollTop = nextContentHeight + SCROLLBAR_WIDTH - tableBodyHeight;

        // If the top value of the current scroll is greater than the scrollable range,
        // keep the vertical scroll bar at the bottom.
        if (maxScrollTop > 0 && currentScrollTop > maxScrollTop) {
            if (virtualized) {
                onTableScroll?.({ y: (data?.length || 0) * getRowHeight() - tableBodyHeight });
            } else {
                onTableScroll?.({ y: maxScrollTop });
            }
        }

        if (prevContentHeight !== contentHeight.current) {
            onTableResizeChange?.(prevContentHeight, 'bodyHeightChanged');
        }

    }, [
        tableRef,
        prefix,
        affixHeader,
        headerHeight,
        autoHeight,
        maxHeight,
        fillHeight,
        showHeader,
        getRowHeight,
        data,
        onTableScroll,
        onTableResizeChange
    ]);

    const setOffsetByAffix = useCallback(() => {
        const headerNode = headerWrapperRef?.current;
        if (isNumberOrTrue(affixHeader) && headerNode) {
            headerOffset.current = getOffset(headerNode);
        }

        if (isNumberOrTrue(affixHorizontalScrollbar) && tableRef?.current) {
            tableOffset.current = getOffset(tableRef?.current);
        }
    }, [affixHeader, affixHorizontalScrollbar, headerWrapperRef, tableRef]);

    const calculateTableContentWidth = useCallback(() => {
        const prevWidth = contentWidth.current; //0
        const prevColumnCount = columnCount.current; //0
        const table = tableRef?.current; //undefined
        const row = table?.querySelector(`.${prefix('row')}:not(.virtualized)`); //undefined

        let nextContentWidth = row ? getWidth(row) : 0;

        // Accounting for the width of the scroll bar if present.
        const hasHorizontalScrollbar = contentWidth.current > tableWidth.current;
        const scrollbarWidth = hasHorizontalScrollbar ? 0 : SCROLLBAR_WIDTH;

        contentWidth.current = nextContentWidth - (autoHeight ? scrollbarWidth : 0);
        columnCount.current = row?.querySelectorAll(`.${prefix('cell')}`).length || 0;

        // The value of SCROLLBAR_WIDTH is subtracted so that the scroll bar does not block the content part.
        // There is no vertical scroll bar after autoHeight.
        const minScrollWidth =
            -(nextContentWidth - tableWidth.current) - (autoHeight ? 0 : scrollbarWidth);

        if (minScrollX.current !== minScrollWidth) {
            minScrollX.current = minScrollWidth;

            if (scrollX.current < minScrollWidth) {
                // fix: 405#issuecomment-1464831646
                scrollX.current = minScrollWidth;
            }
        }

        /**
         * If the width of the content area and the number of columns change,
         * the horizontal scroll bar is reset.
         * fix: https://github.com/rsuite/rsuite/issues/2039
         */
        if (
            (prevWidth > 0 && prevWidth !== contentWidth.current) ||
            (prevColumnCount > 0 && prevColumnCount !== columnCount.current)
        ) {
            onTableResizeChange?.(prevWidth, 'bodyWidthChanged');
        }
    }, [autoHeight, onTableResizeChange, prefix, tableRef]);

    const calculateTableWidth = useCallback(
        (nextWidth?: number) => {
            const prevWidth = tableWidth.current;

            if (tableRef?.current) {
                tableWidth.current = nextWidth || getWidth(tableRef?.current);
            }

            if (prevWidth && prevWidth !== tableWidth.current) {
                scrollX.current = 0;
                onTableResizeChange?.(prevWidth, 'widthChanged');
            }

            setOffsetByAffix();
        },
        [onTableResizeChange, setOffsetByAffix, tableRef]
    );

    const calculateTableHeight = useCallback(
        (nextHeight?: number) => {
            const prevHeight = tableHeight.current;

            if (nextHeight) {
                tableHeight.current = nextHeight;
            } else if (tableRef?.current) {
                tableHeight.current = getHeight(tableRef.current.parentNode as Element);
            }

            if (prevHeight && prevHeight !== tableHeight.current) {
                onTableResizeChange?.(prevHeight, 'heightChanged');
            }

        },
        [onTableResizeChange, tableRef]
    );

    useMount(() => {
        calculateTableContextHeight();
        calculateTableContentWidth();

        calculateTableWidth();
        calculateTableHeight();
        setOffsetByAffix();

        containerResizeObserver.current = new ResizeObserver(entries => {
            calculateTableHeight(entries[0].contentRect.height);
        });
        containerResizeObserver.current.observe(tableRef?.current?.parentNode as Element);
        const changeTableWidthWhenResize = debounce(entries => {
            const { width } = entries[0].contentRect;
            // bordered table width is 1px larger than the container width. fix: #405 #404
            const widthWithBorder = width + 2;

            calculateTableWidth(bordered ? widthWithBorder : width);
        }, 20);
        resizeObserver.current = new ResizeObserver(changeTableWidthWhenResize);
        resizeObserver.current.observe(tableRef?.current as Element);

        return () => {
            resizeObserver.current?.disconnect();
            containerResizeObserver.current?.disconnect();
        };
    });

    useUpdateLayoutEffect(() => {
        calculateTableHeight();
        calculateTableContextHeight();
    }, [fillHeight]);

    useUpdateLayoutEffect(() => {
        calculateTableWidth();
        calculateTableContentWidth();
        calculateTableContextHeight();
    }, [
        data,
        contentHeight.current,
        expandedRowKeys,
        children,
        calculateTableContextHeight,
        calculateTableContentWidth
    ]);

    const isVisible = useIntersectionObserver(tableRef);

    useUpdateLayoutEffect(() => {
        // When the table is visible, the width of the table is recalculated.
        // fix: https://github.com/rsuite/rsuite/issues/397
        if (isVisible) {
            calculateTableWidth();
            calculateTableContentWidth();
        }
    }, [isVisible]);

    const setScrollY = useCallback((value: number) => {
        scrollY.current = value;
    }, []);

    const setScrollX = useCallback((value: number) => {
        scrollX.current = value;
    }, []);

    const getTableHeight = () => {
        if (fillHeight) {
            return tableHeight.current;
        }

        // When the data is empty and autoHeight is set, use the default height to display the empty state.
        if (data?.length === 0 && autoHeight) {
            return props.height;
        }

        const height = autoHeightProp ? headerHeight + contentHeight.current : props.height;

        if (maxHeight && height > maxHeight) {
            return maxHeight;
        }

        if (minHeight && height < minHeight) {
            return minHeight;
        }

        return height;
    };

    return {
        contentHeight,
        contentWidth,
        minScrollY,
        minScrollX,
        scrollY,
        scrollX,
        tableWidth,
        headerOffset,
        tableOffset,
        getTableHeight,
        setScrollY,
        setScrollX
    };
};

export default useTableDimension;
