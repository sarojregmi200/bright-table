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
        <Table
            height={400}
            data={data}
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
                <Cell dataKey="firstName" />
            </Column>

            <Column width={150}>
                <HeaderCell>Last Name</HeaderCell>
                <Cell dataKey="lastName" />
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
            <Column width={80} fixed="right">
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
    )
}

export default App
