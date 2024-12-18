import { Cell, Column, ColumnGroup, HeaderCell, Table } from "../../dist/src/index"
import { data, mockNestedData, } from "./faker";
import { useEffect, useState } from "react";
import { larvelPaginationObject } from "../../dist/types/src/Pagination";

function App() {
    const [data, setData] = useState<data[]>([]);
    const [loading, setLoading] = useState(true);
    const [pin, setPin] = useState(false);

    console.log(pin)

    useEffect(() => {
        const data = mockNestedData(10);
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
                rowSelection
                isTree
                rowKey={"id"}
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
                shouldUpdateScroll={false}
                data={data}
                cellBordered
                height={innerHeight}
                onRowClick={rowData => {
                    console.log(rowData);
                }}
            >
                <Column width={60} align="center" fixed={"left"} >
                    <HeaderCell >Id</HeaderCell>
                    <Cell dataKey="id" />
                </Column>

                <ColumnGroup header="User Name">
                    <Column width={250} fixed={pin ? "right" : false} >
                        <HeaderCell>First Name</HeaderCell>
                        <Cell dataKey="firstname" />
                    </Column>

                    <Column width={150}>
                        <HeaderCell>Last Name</HeaderCell>
                        <Cell dataKey="lastname" />
                    </Column>

                </ColumnGroup>

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

            <div className="pincol">
                <button onClick={() => { setPin(prev => !prev) }}>
                    pincol
                </button>
            </div>
        </div>
    )
}

export default App




