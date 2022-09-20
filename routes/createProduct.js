const fs = require('fs');
const {faker} = require("@faker-js/faker")
const csv = require('csvtojson');
const createProduct = async () => {
    let newData =  await csv().fromFile("Pokemon.csv");
    newIds = new Set(newData.map((e) => Object.values(e)[0]));
    newIds = Array.from(newIds);
    Data = newIds.map((id) => {
        let newName = newData.find((e) => Object.values(e)[0] === id)
        let types = [newName["Type 1"].toLowerCase(),newName["Type 2"].toLowerCase()]
        let description = faker.commerce.productDescription()
        let height = faker.random.numeric(5)
        let weight = faker.datatype.float({ max: 100 })
        let categpry = faker.database.engine()
        let abilities = faker.word.adjective()
        if (!newName["Type 2"]) {
            types = [newName["Type 1"].toLowerCase()]
        }
        return {
            id: id,
            name : newName.Name,
            description,
            height,
            weight,
            categpry,
            abilities,
            types,
            url: `http://localhost:3000/images/${id}.png`
        }
    })
    let data = JSON.parse(fs.readFileSync("routes/db.json"));
    data.pokemons = Data;
    fs.writeFileSync("routes/db.json", JSON.stringify(data));
    console.log(Data)
}

createProduct();