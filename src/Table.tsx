import React, { useRef, useCallback, useImperativeHandle, useReducer, useMemo, ReactNode, cloneElement, memo, forwardRef, ForwardedRef } from 'react';
import * as ReactIs from 'react-is';
import { getTranslateDOMPositionXY } from 'dom-lib/esm/translateDOMPositionXY.js';
import PropTypes from 'prop-types';
import { isFunction } from "lodash";
import { debounce } from "lodash";
import Row, { RowProps } from './Row';
import CellGroup from './CellGroup';
import Scrollbar, { ScrollbarInstance } from './Scrollbar';
import MouseArea from './MouseArea';
import Loader from './Loader';
import EmptyMessage from './EmptyMessage';
import TableContext from './TableContext';
import Cell, { InnerCellProps } from './Cell';
import HeaderCell, { HeaderCellProps } from './HeaderCell';
import Column, { ColumnProps } from './Column';
import ColumnGroup from './ColumnGroup';
import {
    SCROLLBAR_WIDTH,
    CELL_PADDING_HEIGHT,
    SORT_TYPE,
    TREE_DEPTH,
    ROW_HEADER_HEIGHT,
    ROW_HEIGHT
} from './constants';
import {
    mergeCells,
    isRTL,
    findRowKeys,
    resetLeftForCells,
    useClassNames,
    useControlled,
    useUpdateEffect,
    useCellDescriptor,
    useTableDimension,
    useTableRows,
    useAffix,
    useScrollListener,
    usePosition,
    useTableData,
    isSupportTouchEvent
} from './utils';

import type {
    StandardProps,
    SortType,
    RowKeyType,
    TableLocaleType,
    TableSizeChangeEventName,
    RowDataType,
    OptionalRecord
} from './@types/common';
import { flattenChildren } from './utils/children';

import "./less/index.less";

import Pagination from './Pagination';
import { paginationProps } from './Pagination';
import { rowSelectionState, RowSelectionWrapper } from './utils/useRowSelection';
import { PAGINATION_HEIGHT } from './utils/useTableDimension';

export interface TableProps<Row extends RowDataType, Key extends RowKeyType>
    extends Omit<StandardProps, 'onScroll' | 'children'> {
    /**
     * The height of the table will be automatically expanded according to the number of data rows,
     * and no vertical scroll bar will appear
     * */
    autoHeight?: boolean;

    /**
     * Force the height of the table to be equal to the height of its parent container.
     * Cannot be used together with autoHeight.
     */
    fillHeight?: boolean;

    /** Affix the table header to the specified position on the page */
    affixHeader?: boolean | number;

    /** Affix the table horizontal scrollbar to the specified position on the page */
    affixHorizontalScrollbar?: boolean | number;

    /** Show the border of the table
     *  @deprecated
     *
     *  now defaults to border.
     */
    bordered?: boolean;

    /** specifies if the page is in darkmode or not.
     * @default false
     */
    isDarkMode?: boolean;

    /** Display the borders of table cells */
    cellBordered?: boolean;

    /** Default sort type */
    defaultSortType?: SortType;

    /** Disable scroll bar */
    disabledScroll?: boolean;

    /** Expand all nodes By default */
    defaultExpandAllRows?: boolean;

    /** Specify the default expanded row by  rowkey */
    defaultExpandedRowKeys?: readonly Key[];

    /** Table data */
    data?: readonly Row[];

    /** Specify the default expanded row by  rowkey (Controlled) */
    expandedRowKeys?: readonly Key[];

    /** The visible height of the table (the height of the scrollable container). */
    height?: number;

    /** The minimum height of the table. The height is maintained even when the content is not stretched. */
    minHeight?: number;

    /**
     * The maximum height of the table.
     * Usually used together with `autoHeight`. When the height of the table exceeds `maxHeight`, the table will have a scroll bar.
     */
    maxHeight?: number;

    /** The row of the table has a mouseover effect */
    hover?: boolean;

    /** The height of the table header */
    headerHeight?: number;

    /** The component localized character set. */
    locale?: TableLocaleType;

    /** Show loading */
    loading?: boolean;

    /** Whether to enable loading animation */
    loadAnimation?: boolean;

    /** The row height of the table */
    rowHeight?: number | ((rowData?: Row) => number);

    /** Each row corresponds to the unique key in  data */
    rowKey?: RowKeyType;

    /** The table will be displayed as a tree structure */
    isTree?: boolean;

    /** Set the height of an expandable area */
    rowExpandedHeight?: ((rowData?: Row) => number) | number;

    /** Add an optional extra class name to row */
    rowClassName?: string | ((rowData: Row, rowIndex: number) => string);

    /** Whether to display the header of the table */
    showHeader?: boolean;

    /** Sort Column Name */
    sortColumn?: string;

    /** Sort type */
    sortType?: SortType;

    /**
     * Use the return value of `shouldUpdateScroll` to determine
     * whether to update the scroll after the table size is updated.
     */
    shouldUpdateScroll?:
    | boolean
    | ((event: TableSizeChangeEventName) => {
        x?: number;
        y?: number;
    });

    /** Enable 3D transition rendering to improve performance when scrolling. */
    translate3d?: boolean;

    /** Right to left */
    rtl?: boolean;

    /** The width of the table. When it is not set, it will adapt according to the container */
    width?: number;

    /**
     * Whether to appear line breaks where text overflows its content box
     * https://developer.mozilla.org/en-US/docs/Web/CSS/word-break
     */
    wordWrap?: boolean | 'break-all' | 'break-word' | 'keep-all';

    /** Effectively render large tabular data
     * Virtualized list is not required for now.
     * Other ways of loading data is being researched.
     * @deprecated
    **/
    virtualized?: boolean;

    /** Tree table, the callback function in the expanded node */
    renderTreeToggle?: (
        expandButton: React.ReactNode,
        rowData?: Row,
        expanded?: boolean
    ) => React.ReactNode;

    /** Customize what you can do to expand a zone */
    renderRowExpanded?: (rowData?: Row) => React.ReactNode;

    /** Custom row element */
    renderRow?: (children?: React.ReactNode, rowData?: Row) => React.ReactNode;

    /** Customized data is empty display content */
    renderEmpty?: (info: React.ReactNode) => React.ReactNode;

    /** Customize the display content in the data load */
    renderLoading?: (loading: React.ReactNode) => React.ReactNode;

    /** Click the callback function after the row and return to rowDate */
    onRowClick?: (rowData: Row, event: React.MouseEvent) => void;

    /** Callback after right-click row */
    onRowContextMenu?: (rowData: Row, event: React.MouseEvent) => void;

    /** Callback function for scroll bar scrolling */
    onScroll?: (scrollX: number, scrollY: number) => void;

    /** Click the callback function of the sort sequence to return the value sortColumn, sortType */
    onSortColumn?: (dataKey: string, sortType?: SortType) => void;

    /** Tree table, the callback function in the expanded node */
    onExpandChange?: (expanded: boolean, rowData: Row) => void;

    /** Callback for the `touchstart` event. */
    onTouchStart?: (event: React.TouchEvent) => void;

    /** Callback for the `touchmove` event. */
    onTouchMove?: (event: React.TouchEvent) => void;

    /** Callback for the `touchend` event. */
    onTouchEnd?: (event: React.TouchEvent) => void;

    /**
     * Callback after table data update.
     * @deprecated use `shouldUpdateScroll` instead
     **/
    onDataUpdated?: (nextData: Row[], scrollTo: (coord: { x: number; y: number }) => void) => void;

    /**
     * A ref attached to the table body element
     * @deprecated use `ref` instead (see `ref.current.body`)
     **/
    bodyRef?: (ref: HTMLElement) => void;

    /** Additional theme configuration for custom theme. */
    theme?: themeObject;

    /**
     * Server side laravel pagination.
     */
    pagination?: paginationProps;

    /**
     * Displays checkbox for selecting rows.
     */
    rowSelection?: boolean;

    /**
     * Callback function when a row gets selected
     */
    onRowSelect?: (state: rowSelectionState) => void


    /**
     * Add something at the top of table.Like a navigaiton
     * provides  headersProps.
     * example: Search with some filter icons.
     */
    renderTableTopNav?: (headers: Record<string, any>[], isTree: boolean) => ReactNode;

    /**
     * Header customize btn click function.
     *
     */
    onHeaderCustomizeClick?: (headerProps: Record<string, any>, event: React.MouseEvent) => void;

    children?:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: {
        Cell: (
            props: InnerCellProps<Row, Key> & React.RefAttributes<HTMLDivElement>
        ) => React.ReactElement;
        Column: (props: ColumnProps<Row>) => React.ReactElement;
        ColumnGroup: typeof ColumnGroup;
        HeaderCell: (
            props: HeaderCellProps<Row, Key> & React.RefAttributes<HTMLDivElement>
        ) => React.ReactElement;
    }) => React.ReactNode | React.ReactNode[]);

}

export type themeObject = OptionalRecord<
    "border-color"
    | "head-background"
    | "body-background"
    | "pagination-background"
    | "resize-mouse-color"
    | "row-hover-color"
    | "row-active-color"
    | "text-primary"

    | "border-color-dark"
    | "head-background-dark"
    | "body-background-dark"
    | "pagination-background-dark"
    | "resize-mouse-color-dark"
    | "row-hover-color-dark"
    | "row-active-color-dark"
    | "text-primary-dark"
    | "loader-spin-ring-color-dark"
    | "loader-spin-ring-active-color-dark"

    | "loader-spin-ring-wide"
    | "loader-spin-ring-color"
    | "loader-spin-ring-active-color"
    | "loader-duration-normal"
    , string>

interface TableRowProps extends RowProps {
    key?: string | number;
    rowIndex: number;
    depth?: number;
}

const DATA_PLACEHOLDER = [];

const getChildrenProps = {
    Cell,
    HeaderCell,
    Column,
    ColumnGroup
};

type TableTopNav = {
    renderTableTopNav?: (headers: Record<string, any>[], isTree: boolean) => ReactNode,
    headerProps: Record<string, any>[],
    isTree: boolean
}

// Move TableTopNav outside the main component
const TableTopNav = memo(forwardRef(({ renderTableTopNav, headerProps, isTree }: TableTopNav, ref: ForwardedRef<HTMLDivElement>) => {
    return renderTableTopNav
        ? (
            <div id="bt-table-top-nav" className='w-full h-max' ref={ref}>
                {renderTableTopNav(headerProps, isTree)}
            </div>
        )
        : null;
}));

const Table = React.forwardRef(
    <Row extends RowDataType, Key extends RowKeyType>(props: TableProps<Row, Key>, ref) => {
        const {
            affixHeader,
            children: getChildren,
            classPrefix = 'bright-table',
            className,
            data: dataProp = DATA_PLACEHOLDER,
            defaultSortType = SORT_TYPE.DESC as SortType,
            width: widthProp,
            expandedRowKeys: expandedRowKeysProp,
            defaultExpandAllRows,
            defaultExpandedRowKeys,
            style,
            id,
            isTree,
            hover = true,
            cellBordered,
            wordWrap,
            loading,
            locale = {
                emptyMessage: 'No data found',
                loading: 'Loading...'
            },
            showHeader = true,
            sortColumn,
            rowHeight = ROW_HEIGHT,
            sortType: sortTypeProp,
            headerHeight: headerHeightProp = ROW_HEADER_HEIGHT,
            minHeight = 0,
            maxHeight,
            height = 200,
            autoHeight,
            fillHeight,
            rtl: rtlProp,
            translate3d,
            rowKey,
            virtualized,
            rowClassName,
            rowExpandedHeight = 100,
            disabledScroll,
            affixHorizontalScrollbar,
            loadAnimation,
            shouldUpdateScroll = true,
            renderRow: renderRowProp,
            renderRowExpanded: renderRowExpandedProp,
            renderLoading,
            renderEmpty,
            onSortColumn,
            onScroll,
            renderTreeToggle,
            onRowClick,
            onRowContextMenu,
            onExpandChange,
            onTouchStart,
            onTouchMove,
            onTouchEnd,

            // newly added features
            isDarkMode = false,
            rowSelection = false,
            // pagination properties
            pagination,
            onRowSelect,
            renderTableTopNav,
            onHeaderCustomizeClick,
            ...rest
        } = props;

        const children = useMemo(
            () => flattenChildren(isFunction(getChildren) ? getChildren(getChildrenProps) : getChildren),
            [getChildren]
        );

        const isAutoHeight = useMemo(() => autoHeight && !maxHeight, [autoHeight, maxHeight]);

        const {
            withClassPrefix,
            merge: mergeCls,
            prefix
        } = useClassNames(classPrefix, typeof classPrefix !== 'undefined');

        // Use `forceUpdate` to force the component to re-render after manipulating the DOM.
        const [, forceUpdate] = useReducer(x => x + 1, 0);

        const [expandedRowKeys, setExpandedRowKeys] = useControlled(
            expandedRowKeysProp,
            defaultExpandAllRows
                ? findRowKeys(dataProp, rowKey, isFunction(renderRowExpandedProp))
                : defaultExpandedRowKeys || []
        );

        const data = useTableData({ data: dataProp, isTree, expandedRowKeys, rowKey });

        if (isTree) {
            if (!rowKey) {
                throw new Error('The `rowKey` is required when set isTree');
            } else if (data.length > 0) {
                if (!data[0].hasOwnProperty(rowKey)) {
                    throw new Error('The `rowKey` is not found in data');
                }
            }
        }

        const { tableRowsMaxHeight, bindTableRowsRef } = useTableRows({
            data: dataProp,
            expandedRowKeys,
            wordWrap,
            prefix
        });

        const headerHeight = showHeader ? headerHeightProp : 0;
        const rtl = rtlProp || isRTL();

        const getRowHeight = () => {
            return typeof rowHeight === 'function' ? rowHeight() : rowHeight;
        };

        const translateDOMPositionXY = useRef(
            getTranslateDOMPositionXY({ forceUseTransform: true, enable3DTransform: translate3d })
        );

        // Check for the existence of fixed columns in all column properties.
        const shouldFixedColumn = children.some(
            child => ReactIs.isElement(child) && child?.props?.fixed
        );

        // Check all column properties for the existence of rowSpan.
        const shouldRowSpanColumn = children.some(
            child => ReactIs.isElement(child) && child?.props?.rowSpan
        );

        const visibleRows = useRef<React.ReactNode[]>([]);

        const mouseAreaRef = useRef<HTMLDivElement>(null);
        const tableRef = useRef<HTMLDivElement>(null);
        const tableHeaderRef = useRef<HTMLDivElement>(null);
        const affixHeaderWrapperRef = useRef<HTMLDivElement>(null);
        const headerWrapperRef = useRef<HTMLDivElement>(null);
        const tableBodyRef = useRef<HTMLDivElement>(null);
        const wheelWrapperRef = useRef<HTMLDivElement>(null);
        const scrollbarXRef = useRef<ScrollbarInstance>(null);
        const scrollbarYRef = useRef<ScrollbarInstance>(null);

        const handleTableResizeChange = (_prevSize, event: TableSizeChangeEventName) => {
            forceUpdate();

            /**
             * Reset the position of the scroll bar after the table size changes.
             */
            if (typeof shouldUpdateScroll === 'function') {
                onScrollTo(shouldUpdateScroll(event));
            } else if (shouldUpdateScroll) {
                const vertical = event === 'bodyHeightChanged';
                vertical ? onScrollTop(0) : onScrollLeft(0);
            }

            if (event === 'bodyWidthChanged') {
                deferUpdatePosition();
            }
        };

        const {
            contentHeight,
            contentWidth,
            minScrollY,
            minScrollX,
            scrollY,
            scrollX,
            tableWidth,
            tableOffset,
            headerOffset,
            setScrollY,
            setScrollX,
            getTableHeight
        } = useTableDimension({
            // The data should be flattened,
            // otherwise the array length required to calculate the scroll height in the TreeTable is not real.
            data,
            width: widthProp,
            rowHeight,
            tableRef,
            headerWrapperRef,
            prefix,
            affixHeader,
            affixHorizontalScrollbar,
            headerHeight,
            height,
            minHeight,
            maxHeight,
            autoHeight,
            fillHeight,
            children,
            expandedRowKeys,
            showHeader,
            onTableScroll: debounce((coords: { x?: number; y?: number }) => onScrollTo(coords), 100),
            onTableResizeChange: handleTableResizeChange
        });


        useAffix({
            getTableHeight,
            contentHeight,
            affixHorizontalScrollbar,
            affixHeader,
            tableOffset,
            headerOffset,
            headerHeight,
            scrollbarXRef,
            affixHeaderWrapperRef
        });

        const { forceUpdatePosition, deferUpdatePosition } = usePosition({
            data: dataProp,
            height,
            tableWidth,
            tableRef,
            prefix,
            translateDOMPositionXY,
            wheelWrapperRef,
            headerWrapperRef,
            affixHeaderWrapperRef,
            tableHeaderRef,
            scrollX,
            scrollY,
            contentWidth,
            shouldFixedColumn
        });

        const {
            isScrolling,
            onScrollHorizontal,
            onScrollVertical,
            onScrollBody,
            onScrollTop,
            onScrollLeft,
            onScrollTo,
            onScrollByKeydown
        } = useScrollListener({
            rtl,
            data: dataProp,
            height,
            virtualized,
            getTableHeight,
            contentHeight,
            headerHeight,
            autoHeight: isAutoHeight,
            maxHeight,
            tableBodyRef,
            scrollbarXRef,
            scrollbarYRef,
            disabledScroll,
            loading,
            tableRef,
            contentWidth,
            tableWidth,
            scrollY,
            minScrollY,
            minScrollX,
            scrollX,
            setScrollX,
            setScrollY,
            forceUpdatePosition,
            deferUpdatePosition,
            onScroll,
            onTouchStart,
            onTouchMove,
            onTouchEnd
        });

        const { headerCells, bodyCells, allColumnsWidth, hasCustomTreeCol } = useCellDescriptor({
            children,
            rtl,
            mouseAreaRef,
            tableRef,
            minScrollX,
            scrollX,
            tableWidth,
            headerHeight,
            showHeader,
            sortType: sortTypeProp,
            defaultSortType,
            sortColumn,
            prefix,
            onSortColumn,

            // Force table update after column width change, so scrollbar re-renders.
            onHeaderCellResize: forceUpdate,
            rowHeight
        });

        const colCounts = useRef(headerCells?.length || 0);

        useUpdateEffect(() => {
            if (headerCells?.length !== colCounts.current) {
                onScrollLeft(0);
                colCounts.current = headerCells?.length || 0;
            }
        }, [children]);

        useImperativeHandle(ref, () => ({
            get root() {
                return tableRef.current;
            },
            get body() {
                return wheelWrapperRef.current;
            },

            // The scroll position of the table
            get scrollPosition() {
                return {
                    top: Math.abs(scrollY.current),
                    left: Math.abs(scrollX.current)
                };
            },
            scrollTop: onScrollTop,
            scrollLeft: onScrollLeft
        }));

        const rowWidth = allColumnsWidth > tableWidth.current ? allColumnsWidth : tableWidth.current;

        // Whether to show vertical scroll bar
        const hasVerticalScrollbar =
            !isAutoHeight && contentHeight.current > getTableHeight() - headerHeight;

        // Whether to show the horizontal scroll bar
        const hasHorizontalScrollbar = contentWidth.current > tableWidth.current;

        const classes = mergeCls(
            className,
            withClassPrefix({
                loading,
                treetable: isTree,
                hover: hover && !shouldRowSpanColumn,
                'has-rowspan': shouldRowSpanColumn,
                'word-wrap': wordWrap,
                'cell-bordered': cellBordered
            })
        );

        const styles = {
            width: widthProp || 'auto',
            height: getTableHeight(),
            ...style
        };

        const tableTopNavRef = useRef<HTMLDivElement>(null);

        let ActualTableHeight = styles?.height as number;
        let TableHeightWithPagination = styles?.height as number;

        if (pagination)
            ActualTableHeight -= PAGINATION_HEIGHT

        if (renderTableTopNav) {
            const tableTopNavHeight = tableTopNavRef.current?.getBoundingClientRect().height;
            ActualTableHeight -= tableTopNavHeight ?? 0;
            TableHeightWithPagination -= tableTopNavHeight ?? 0;
        }


        const renderRowExpanded = useCallback(
            (rowData?: Row) => {
                let height = 0;
                if (typeof rowExpandedHeight === 'function') {
                    height = rowExpandedHeight(rowData);
                } else {
                    height = rowExpandedHeight;
                }
                const styles = { height };

                if (typeof renderRowExpandedProp === 'function') {
                    return (
                        <div className={prefix('row-expanded')} style={styles}>
                            {renderRowExpandedProp(rowData)}
                        </div>
                    );
                }
                return null;
            },
            [prefix, renderRowExpandedProp, rowExpandedHeight]
        );

        const renderRow = (
            props: TableRowProps,
            cells: any[],
            shouldRenderExpandedRow?: boolean,
            rowData?: any
        ) => {
            const { depth, rowIndex, ...restRowProps } = props;

            if (props.isHeaderRow) {

                cells = cells.map((cell) => {

                    const isCustomizable = cell?.props?.customizable;
                    const hasOnHeaderCustomizeClick = cell?.props?.onHeaderCustomizeClick;

                    if (isCustomizable && !hasOnHeaderCustomizeClick) {
                        const updatedCell = cloneElement(cell, {
                            ...cell.props,
                            onHeaderCustomizeClick: onHeaderCustomizeClick
                        })
                        return updatedCell
                    }

                    return cell;
                })
            }

            if (typeof rowClassName === 'function') {
                restRowProps.className = rowClassName(rowData, rowIndex);
            } else {
                restRowProps.className = rowClassName;
            }

            const rowStyles: React.CSSProperties = {
                ...props?.style
            };
            let rowRight = 0;

            if (rtl && contentWidth.current > tableWidth.current) {
                rowRight = tableWidth.current - contentWidth.current;
                rowStyles.right = rowRight;
            }


            let rowNode: React.ReactNode = null;

            // IF there are fixed columns, add a fixed group
            if (shouldFixedColumn && contentWidth.current > tableWidth.current) {
                const fixedLeftCells: React.ReactNode[] = [];
                const fixedRightCells: React.ReactNode[] = [];
                const scrollCells: React.ReactNode[] = [];
                let fixedLeftCellGroupWidth = 0;
                let fixedRightCellGroupWidth = 0;

                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i];
                    const { fixed, width } = cell.props;

                    let isFixedStart = fixed === 'left' || fixed === true;
                    let isFixedEnd = fixed === 'right';

                    if (rtl) {
                        isFixedStart = fixed === 'right';
                        isFixedEnd = fixed === 'left' || fixed === true;
                    }

                    if (isFixedStart) {
                        fixedLeftCells.push(cell);
                        fixedLeftCellGroupWidth += width;
                    } else if (isFixedEnd) {
                        fixedRightCells.push(cell);
                        fixedRightCellGroupWidth += width;
                    } else {
                        scrollCells.push(cell);
                    }

                }

                if (hasVerticalScrollbar && fixedRightCellGroupWidth) {
                    fixedRightCellGroupWidth += SCROLLBAR_WIDTH;
                }



                rowNode = (
                    <>
                        {fixedLeftCellGroupWidth ? (
                            <CellGroup
                                fixed="left"
                                height={props.isHeaderRow ? props.headerHeight : props.height}
                                width={fixedLeftCellGroupWidth}
                                style={
                                    rtl
                                        ? { right: tableWidth.current - fixedLeftCellGroupWidth - rowRight }
                                        : undefined
                                }
                            >
                                {mergeCells(resetLeftForCells(fixedLeftCells), {
                                    isDarkMode,
                                    onRowSelect: onRowSelect,
                                    shouldRenderCheckbox: !rtl && rowSelection
                                })}
                            </CellGroup>
                        ) : null}

                        <CellGroup>
                            {mergeCells(scrollCells, {
                                isDarkMode,
                                leftFixedWidth: fixedLeftCellGroupWidth,
                                onRowSelect: onRowSelect,
                                shouldRenderCheckbox: !fixedLeftCellGroupWidth && rowSelection
                            })}
                        </CellGroup>

                        {fixedRightCellGroupWidth ? (
                            <CellGroup
                                fixed="right"
                                style={
                                    rtl
                                        ? { right: 0 - rowRight }
                                        : { left: tableWidth.current - fixedRightCellGroupWidth }
                                }
                                height={props.isHeaderRow ? props.headerHeight : props.height}
                                width={fixedRightCellGroupWidth}
                            >
                                {mergeCells(
                                    resetLeftForCells(fixedRightCells, hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0),
                                    {
                                        onRowSelect: onRowSelect,
                                        isDarkMode,
                                        shouldRenderCheckbox: rtl && rowSelection
                                    }
                                )}
                            </CellGroup>
                        ) : null}

                        {shouldRenderExpandedRow && renderRowExpanded(rowData)}
                    </>
                );
            } else {
                rowNode = (
                    <>
                        <CellGroup>
                            {mergeCells(cells, {
                                onRowSelect: onRowSelect,
                                shouldRenderCheckbox: rowSelection
                            })}
                        </CellGroup>
                        {shouldRenderExpandedRow && renderRowExpanded(rowData)}
                    </>
                );
            }


            return (
                <Row {...restRowProps} data-depth={depth} style={rowStyles}>
                    {renderRowProp ? renderRowProp(rowNode, rowData) : rowNode}
                </Row>
            );
        };

        const renderTableHeader = (headerCells: any[], rowWidth: number) => {
            const top = typeof affixHeader === 'number' ? affixHeader : 0;
            const rowProps: TableRowProps = {
                'aria-rowindex': 1,
                rowRef: tableHeaderRef,
                width: rowWidth,
                height: getRowHeight(),
                headerHeight,
                isHeaderRow: true,
                top: 0,
                rowIndex: -1,
            };

            const fixedStyle: React.CSSProperties = {
                position: 'fixed',
                overflow: 'hidden',
                height: headerHeight,
                width: tableWidth.current,
                top
            };

            // Affix header
            const header = (
                <div className={prefix('affix-header')} style={fixedStyle} ref={affixHeaderWrapperRef}>
                    {renderRow(rowProps, headerCells)}
                </div>
            );

            return (
                <React.Fragment>
                    {(affixHeader === 0 || affixHeader) && header}
                    <div role="rowgroup" className={prefix('header-row-wrapper')} ref={headerWrapperRef}>
                        {renderRow(rowProps, headerCells)}
                    </div>
                </React.Fragment>
            );
        };

        const shouldRenderExpandedRow = useCallback(
            (rowData: Row) => {
                if (
                    isFunction(renderRowExpandedProp) &&
                    !isTree &&
                    rowKey &&
                    expandedRowKeys.some(key => key === rowData[rowKey])
                ) {
                    return true;
                }

                return false;
            },
            [expandedRowKeys, isTree, renderRowExpandedProp, rowKey]
        );

        const bindRowClick = useCallback(
            (rowData: Row) => {
                return (event: React.MouseEvent) => {
                    onRowClick?.(rowData, event);
                };
            },
            [onRowClick]
        );

        const bindRowContextMenu = useCallback(
            (rowData: Row) => {
                return (event: React.MouseEvent) => {
                    onRowContextMenu?.(rowData, event);
                };
            },
            [onRowContextMenu]
        );

        const handleTreeToggle = useCallback(
            (treeRowKey: any, _rowIndex: number, rowData: Row) => {
                let open = false;
                const nextExpandedRowKeys: Key[] = [];

                for (let i = 0; i < expandedRowKeys.length; i++) {
                    const key = expandedRowKeys[i];
                    if (key === treeRowKey) {
                        open = true;
                    } else {
                        nextExpandedRowKeys.push(key);
                    }
                }

                if (!open) {
                    nextExpandedRowKeys.push(treeRowKey);
                }


                setExpandedRowKeys(nextExpandedRowKeys);
                onExpandChange?.(!open, rowData);
            },
            [expandedRowKeys, onExpandChange, setExpandedRowKeys]
        );

        /**
         * Records the status of merged rows.
         * { cellKey: [count,index]}
         */
        const rowSpanState = useRef<{ [cellKey: string]: [number, number] }>({});

        const renderRowData = (
            bodyCells: any[],
            rowData: any,
            props: TableRowProps & { cellHeight?: number },
            shouldRenderExpandedRow?: boolean
        ) => {

            // handling the nested row condition

            // tree parent
            const NestedRowData = rowData?.children;
            const hasChildren = isTree && NestedRowData && (Array.isArray(NestedRowData) && NestedRowData.length > 0);
            const childrenIds = hasChildren
                ? (rowData.children as Record<string, any>[]).map((data: Record<string, any>) => data?.id as string)
                : [];


            const treeChildInfo = {
                parentId: undefined,
                siblingsIds: [],
            }

            // first symbol is the parent symbol
            const symbols = Object.getOwnPropertySymbols(rowData);

            // tree child
            const rowParent = rowData[symbols[0]]
            if (rowParent) {
                treeChildInfo.parentId = rowParent?.id;
                treeChildInfo.siblingsIds = rowParent?.children?.filter((children: any) => children?.id !== rowData?.id)
                    .map((siblings: any) => siblings?.id)
            }

            const nextRowKey =
                rowKey && typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.key;

            const { cellHeight, ...restRowProps } = props;

            const rowProps: TableRowProps = {
                ...restRowProps,
                key: nextRowKey,
                'aria-rowindex': (props.key as number) + 2,

                rowRef: bindTableRowsRef(props.key as any, rowData),
                onClick: bindRowClick(rowData),
                onContextMenu: bindRowContextMenu(rowData)
            };

            const expanded = expandedRowKeys.some(key => rowKey && key === rowData[rowKey]);
            const cells: React.ReactNode[] = [];

            for (let i = 0; i < bodyCells.length; i++) {
                const cell = bodyCells[i];
                const rowSpan: number = cell.props?.rowSpan?.(rowData);
                const dataCellHeight = rowSpan ? rowSpan * (cellHeight || ROW_HEIGHT) : cellHeight;
                const cellKey = cell.props.dataKey || i;

                // Record the cell state of the merged row
                if (rowSpanState.current[cellKey]?.[1] > 0) {
                    rowSpanState.current[cellKey][1] -= 1;

                    // Restart counting when merged to the last cell.
                    if (rowSpanState.current[cellKey][1] === 0) {
                        rowSpanState.current[cellKey][0] = 0;
                    }
                }

                if (rowSpan) {
                    // The state of the initial merged cell
                    rowSpanState.current[cellKey] = [rowSpan, rowSpan];
                    rowProps.rowSpan = rowSpan;
                    rowProps.style = { overflow: 'inherit' };
                }

                // Cells marked as deleted when checking for merged cell.
                const removedCell = cell.props?.rowSpan && !rowSpan && rowSpanState.current[cellKey]?.[0] !== 0
                    ? true
                    : false;

                cells.push(
                    React.cloneElement(cell, {
                        'aria-rowspan': rowSpan ? rowSpan : undefined,
                        rowData,
                        rowIndex: props.rowIndex,
                        wordWrap,
                        height: dataCellHeight,
                        depth: props.depth,
                        renderTreeToggle,
                        onTreeToggle: handleTreeToggle,
                        rowKey: nextRowKey,
                        expanded,
                        rowSpan,

                        // tree table props
                        isTree: isTree,
                        // parent
                        childrenIds,
                        hasChildren,

                        // child
                        ...treeChildInfo,

                        expandedRowKeys,
                        removed: removedCell
                    })
                );
            }

            return renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
        };

        const renderScrollbar = () => {
            const height = getTableHeight();

            if (disabledScroll) {
                return null;
            }

            const scrollbars: React.ReactNode[] = [];

            if (hasHorizontalScrollbar) {
                scrollbars.push(
                    <Scrollbar
                        key="scrollbar"
                        tableId={id}
                        style={{ width: tableWidth.current }}
                        length={tableWidth.current}
                        onScroll={onScrollHorizontal}
                        scrollLength={contentWidth.current}
                        ref={scrollbarXRef}
                    />
                );
            }

            if (hasVerticalScrollbar) {
                scrollbars.push(
                    <Scrollbar
                        vertical
                        key="vertical-scrollbar"
                        tableId={id}
                        length={height - headerHeight}
                        onScroll={onScrollVertical}
                        scrollLength={contentHeight.current}
                        ref={scrollbarYRef}
                    />
                );
            }

            return scrollbars;
        };


        const RenderTableBody = ({ bodyCells, rowWidth }: { bodyCells: any[], rowWidth: number }) => {
            const bodyHeight = ActualTableHeight - headerHeight;
            const bodyStyles = {
                top: headerHeight,
                height: bodyHeight
            };

            let contentHeight = 0;
            let topHideHeight = 0;
            let bottomHideHeight = 0;

            visibleRows.current = [];

            if (data.length) {
                let top = 0; // Row position
                let minTop = Math.abs(scrollY.current);
                let startHeight = 0;
                if (typeof rowExpandedHeight === 'function') {
                    startHeight = data.length ? rowExpandedHeight(data[0]) : 100;
                } else {
                    startHeight = rowExpandedHeight;
                }

                let maxTop = minTop + height + startHeight;
                // Avoid white screens on the top and bottom of the table when touching and scrolling on the mobile terminal.
                // So supplement the display data row.
                if (isSupportTouchEvent()) {
                    const coveredHeight = height * 3;
                    minTop = Math.max(minTop - coveredHeight, 0);
                    maxTop = maxTop + coveredHeight;
                }

                for (let index = 0; index < data.length; index++) {
                    const rowData = data[index];
                    const maxHeight = tableRowsMaxHeight[index];
                    const expandedRow = shouldRenderExpandedRow(rowData);

                    let nextRowHeight = 0;
                    let cellHeight = 0;

                    if (typeof rowHeight === 'function') {
                        nextRowHeight = rowHeight(rowData);
                        cellHeight = nextRowHeight;
                    } else {
                        nextRowHeight = maxHeight
                            ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight)
                            : rowHeight;

                        cellHeight = nextRowHeight;
                        if (expandedRow) {
                            // If the row is expanded, the height of the expanded row is added.
                            if (typeof rowExpandedHeight === 'function') {
                                nextRowHeight += rowExpandedHeight(rowData);
                            } else {
                                nextRowHeight += rowExpandedHeight;
                            }
                        }
                    }

                    contentHeight += nextRowHeight;

                    const rowProps = {
                        key: index,
                        top,
                        rowIndex: index,
                        width: rowWidth,
                        depth: rowData[TREE_DEPTH],
                        height: nextRowHeight,
                        cellHeight
                    };

                    top += nextRowHeight;

                    if (virtualized && !wordWrap) {
                        if (top + nextRowHeight < minTop) {
                            topHideHeight += nextRowHeight;
                            continue;
                        } else if (top > maxTop) {
                            bottomHideHeight += nextRowHeight;
                            continue;
                        }
                    }

                    visibleRows.current.push(renderRowData(bodyCells, rowData, rowProps, expandedRow));
                }
            }

            const wheelStyles: React.CSSProperties = {
                position: 'absolute',
                height: contentHeight,
                minHeight: height,
                pointerEvents: isScrolling ? 'none' : undefined
            };

            return (
                <div
                    ref={tableBodyRef}
                    role="rowgroup"
                    className={prefix('body-row-wrapper')}
                    style={bodyStyles}
                    onScroll={onScrollBody}>

                    <div style={wheelStyles} className={prefix('body-wheel-area')} ref={wheelWrapperRef}>
                        {visibleRows.current}
                    </div>

                    <EmptyMessage
                        locale={locale}
                        renderEmpty={renderEmpty}
                        addPrefix={prefix}
                        loading={!!visibleRows.current?.length || loading}
                    />
                    {renderScrollbar()}
                    <Loader
                        locale={locale}
                        loadAnimation={loadAnimation}
                        loading={loading}
                        addPrefix={prefix}
                        renderLoading={renderLoading}
                    />
                </div>
            );
        };

        const contextValue = React.useMemo(
            () => ({
                classPrefix,
                translateDOMPositionXY: translateDOMPositionXY.current,
                rtl,
                isTree,
                hasCustomTreeCol
            }),
            [classPrefix, hasCustomTreeCol, isTree, rtl]
        );

        const renderDefaultPagination = () => {
            if (data.length && pagination)
                return (
                    <div className="paginationWrapper w-full h-16 bg-white">
                        <Pagination {...pagination} />
                    </div>
                )

            return null;
        }

        // Memoize headerProps
        const headerProps = useMemo(() =>
            (headerCells as any)?.map((header: any) => header.props),
            [headerCells] // Only recalculate if headerCells changes
        );

        return (
            <RowSelectionWrapper>
                <TableContext.Provider value={contextValue}>
                    <div
                        className="bt-container space-y-2.5 overflow-hidden"
                        style={{
                            height: style?.height,
                            width: style?.width
                        }}
                    >
                        <TableTopNav
                            ref={tableTopNavRef}
                            isTree={isTree || false}
                            renderTableTopNav={renderTableTopNav}
                            headerProps={headerProps}
                        />

                        <div
                            className='bt-wrapper relative border border-[var(--border-color)]'
                            style={{
                                width: styles.width,
                                height: TableHeightWithPagination,
                                ...style
                            }}>
                            <div
                                role={isTree ? 'treegrid' : 'grid'}
                                // The aria-rowcount is specified on the element with the table.
                                // Its value is an integer equal to the total number of rows available, including header rows.
                                aria-rowcount={data.length + 1}
                                aria-colcount={colCounts.current}
                                {...rest}
                                className={classes}
                                style={{ height: ActualTableHeight, width: styles?.width }}
                                ref={tableRef}
                                tabIndex={-1}
                                onKeyDown={onScrollByKeydown}
                            >
                                {showHeader && renderTableHeader(headerCells, rowWidth)}
                                {children && <RenderTableBody bodyCells={bodyCells} rowWidth={rowWidth} />}
                            </div>
                            {pagination ? renderDefaultPagination() : null}
                            {showHeader && (
                                <MouseArea
                                    ref={mouseAreaRef}
                                    addPrefix={prefix}
                                    headerHeight={headerHeight}
                                    height={ActualTableHeight}
                                />
                            )}

                        </div>
                    </div>
                </TableContext.Provider>
            </RowSelectionWrapper >
        );
    }
);

Table.displayName = 'Table';
Table.propTypes = {
    autoHeight: PropTypes.bool,
    fillHeight: PropTypes.bool,
    affixHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    affixHorizontalScrollbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    children: PropTypes.any,
    cellBordered: PropTypes.bool,
    data: PropTypes.array,
    defaultExpandAllRows: PropTypes.bool,
    defaultExpandedRowKeys: PropTypes.array,
    defaultSortType: PropTypes.any,
    disabledScroll: PropTypes.bool,
    expandedRowKeys: PropTypes.array,
    hover: PropTypes.bool,
    height: PropTypes.number,
    headerHeight: PropTypes.number,
    locale: PropTypes.object,
    loading: PropTypes.bool,
    loadAnimation: PropTypes.bool,
    minHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    renderTreeToggle: PropTypes.func,
    renderRowExpanded: PropTypes.func,
    renderRow: PropTypes.func,
    rowExpandedHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    renderEmpty: PropTypes.func,
    renderLoading: PropTypes.func,
    rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    rtl: PropTypes.bool,
    style: PropTypes.object,
    sortColumn: PropTypes.string,
    sortType: PropTypes.any,
    showHeader: PropTypes.bool,
    shouldUpdateScroll: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    translate3d: PropTypes.bool,
    wordWrap: PropTypes.any,
    width: PropTypes.number,
    virtualized: PropTypes.bool,
    isTree: PropTypes.bool,
    onRowClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onScroll: PropTypes.func,
    onSortColumn: PropTypes.func,
    onExpandChange: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchMove: PropTypes.func,
    onTouchEnd: PropTypes.func,
};

export interface TableInstance<Row extends RowDataType, Key extends RowKeyType>
    extends React.FunctionComponent<TableProps<Row, Key>> {
    /** The table body element */
    readonly body: HTMLDivElement;
    /** The table root element */
    readonly root: HTMLDivElement;

    /** Scroll the table to the specified vertical position */
    scrollTop: (top: number) => void;

    /** Scroll the table to the specified horizontal position */
    scrollLeft: (left: number) => void;
}

export default Table as <Row extends RowDataType, Key extends RowKeyType>(
    props: TableProps<Row, Key> & React.RefAttributes<TableInstance<Row, Key>>
) => React.ReactElement;
