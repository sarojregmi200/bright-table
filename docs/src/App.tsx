import { Cell, Column, HeaderCell, Table } from "bright-table"
import { data, mockData } from "./faker";
import { useEffect, useState } from "react";


function App() {
    const [data, setData] = useState<data[]>([]);

    useEffect(() => {
        setData(mockData(100));
    });

    const handleAdditionalDataRequest = (reqNum: number) => {
        const additionalData = mockData(reqNum);
        setData((prev) => [...prev, ...additionalData])
    }


    return (
        <div>

            <Table
                totalRows={208}
                defaultPagination
                data={data}
                cellBordered
                onAdditionalDataRequest={(reqDataNum: number) => {
                    if (!reqDataNum) return;
                    handleAdditionalDataRequest(reqDataNum)
                }}
                height={innerHeight}
                onRowClick={rowData => {
                    console.log(rowData);
                }}
            >
                <Column width={60} align="center" fixed>
                    <HeaderCell>Id</HeaderCell>
                    <Cell dataKey="id" />
                </Column>

                <Column width={150}>
                    <HeaderCell>First Name</HeaderCell>
                    <Cell dataKey="firstname" />
                </Column>

                <Column width={150}>
                    <HeaderCell>Last Name</HeaderCell>
                    <Cell dataKey="lastname" />
                </Column>

                <Column width={100}>
                    <HeaderCell>Gender</HeaderCell>
                    <Cell dataKey="gender" />
                </Column>

                <Column width={100}>
                    <HeaderCell>Age</HeaderCell>
                    <Cell dataKey="age" />
                </Column>

                <Column width={150}>
                    <HeaderCell>Postcode</HeaderCell>
                    <Cell dataKey="postcode" />
                </Column>

                <Column width={300}>
                    <HeaderCell>Email</HeaderCell>
                    <Cell dataKey="email" />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell>...</HeaderCell>
                    <Cell style={{ padding: '6px' }}>
                        {rowData => (
                            <button onClick={() => alert(`id:${rowData.id}`)}>
                                Edit
                            </button>
                        )}
                    </Cell>
                </Column>

            </Table>


            <h2>
                Default unstyled bright table
            </h2>
            <span>
                This contains the following additional features:
                <br />
                <strong> Done: </strong>
                <li>Auto import css file. </li>
                <br />
                <br />

                <strong> TODO: </strong>
                <li>Default pagination and it's helper methods. </li>
                <li>Fix Overflow during hover fix.</li>
                <li>
                    Column visibility status controller.
                    <br />
                    where each column has a hidden flag, always_visible flag, Editable flag.
                </li>
                <li>
                    Implementing bright design, and better documentation.
                </li>
                <li>
                    Selectable row, with global selection range selection while holding shift and similar features from current table.
                </li>
                <li>
                    Collapsable rows, when given nested data.
                </li>
                <li>
                    Tailwind support.
                </li>

                <li>
                    Context menu support.
                </li>

                <li>
                    Ability to pass in a theme object.
                </li>

                <li>
                    Ability to edit visible columns.
                </li>

                <li>
                    default search.
                </li>

                <li>
                    column sorting and searching.
                </li>

                <li>
                    column pinning.
                </li>

            </span>

        </div>

    )
}

export default App
