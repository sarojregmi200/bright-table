import { Cell, Column, HeaderCell, Table } from "bright-table"
import { data, mockData } from "./faker";
import { useEffect, useState } from "react";
import { larvelPaginationObject } from "../../dist/types/src/Pagination";


function App() {
    const [data, setData] = useState<data[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = mockData(10);
        setData(data);
        setLoading(false);
    }, []);

    const serverResponse: larvelPaginationObject = {
        "first_page_url": "https://localschool.test/app/messages?page=1",
        "from": 1,
        "last_page": 70,
        "last_page_url": "https://localschool.test/app/messages?page=70",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": "https://localschool.test/app/messages?page=2",
                "label": "2",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=3",
                "label": "3",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=4",
                "label": "4",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=5",
                "label": "5",
                "active": false
            },
            {
                "url": null,
                "label": "...",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=69",
                "label": "69",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=70",
                "label": "70",
                "active": false
            },
            {
                "url": "https://localschool.test/app/messages?page=2",
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "next_page_url": "https://localschool.test/app/messages?page=2",
        "path": "https://localschool.test/app/messages",
        "per_page": 10,
        "prev_page_url": null,
        "to": 10,
        "total": 697
    }

    return (
        <div>
            <Table
                rowSelection={true}
                pagination={{
                    serverResponse,
                    onRowsPerPageChange(newRowPerPage) {
                        console.log(newRowPerPage)
                    },
                    linkComponent: {
                        element: <a />,
                        urlProp: "href"
                    }
                }}
                loading={loading}
                data={data}
                cellBordered
                height={10 * 46}
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
                <li>Default pagination and it's helper methods. </li>
                <li> Tailwind support. </li>
                <li>Fix Overflow during hover fix.</li>

                <br />
                <br />

                <strong> TODO: </strong>

                <li>Checkbox</li>
                <li> column sorting and searching. </li>

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
                    column pinning.
                </li>

            </span>

        </div>

    )
}

export default App
