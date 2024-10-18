import { faker } from "@faker-js/faker";

export type data = {
    id: number;
    firstname: string;
    lastname: string
    gender: string;
    age: number;
    postcode: string;
    email: string;
}

export const mockData = (count: number): data[] => {
    const data: data[] = [];

    for (let i = 0; i < count; i++) {
        data.push({
            id: i,
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            gender: faker.person.gender(),
            age: faker.number.int({ max: 100 }),
            postcode: faker.location.zipCode(),
            email: faker.internet.email()
        });
    }
    return data;
}
