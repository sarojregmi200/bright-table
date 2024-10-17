import { Cell, Column, HeaderCell, Table } from "bright-table"

const data = [
    {
        "id": 1,
        "firstname": "Chelsea",
        "lastname": "Jast",
        "gender": "male",
        "age": 20,
        "postcode": "74687-1119",
        "email": "William75@hotmail.com"
    },
    {
        "id": 2,
        "firstname": "Michel",
        "lastname": "Zieme",
        "gender": "female",
        "age": 45,
        "postcode": "37099",
        "email": "Santa87@yahoo.com"
    },
    {
        "id": 3,
        "firstname": "Chandler",
        "lastname": "Leffler",
        "gender": "female",
        "age": 42,
        "postcode": "31807",
        "email": "Clemmie_Nolan38@yahoo.com"
    },
    {
        "id": 4,
        "firstname": "Freeman",
        "lastname": "Schuppe",
        "gender": "male",
        "age": 46,
        "postcode": "86958",
        "email": "Stone59@yahoo.com"
    },
    {
        "id": 7,
        "firstname": "Mellie",
        "lastname": "Kreiger",
        "gender": "male",
        "age": 29,
        "postcode": "34476",
        "email": "Stuart_Muller@gmail.com"
    },
    {
        "id": 8,
        "firstname": "Verna",
        "lastname": "Stroman",
        "gender": "female",
        "age": 43,
        "postcode": "22524-0074",
        "email": "Cheyenne61@gmail.com"
    },
]

function App() {
    return (
        <div>
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
            </span>

            <Table
                data={data}
                cellBordered
                minHeight={500}
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

                <Column>
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
        </div>
    )
}

export default App
