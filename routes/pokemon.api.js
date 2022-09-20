const crypto = require('crypto')
const fs= require("fs")
const express = require('express')
const { Console } = require('console')
const { type } = require('os')
const router = express.Router()


router.get("/",(req,res,next)=>{
const allowedFilter = [
    "search",
    "type",
    "page",
    "limit",
  ];
  

  try {
    let { page,search,type, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);
    let db = fs.readFileSync("routes/db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    let result = [];
    // console.log(search)
    console.log( search)
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result.data = result.data.length
          ? result.data.filter((pokemon) => pokemon[condition] === filterQuery[condition])
          : pokemons.filter((pokemon) => pokemon[condition] === filterQuery[condition]);
      });
    } else {
      result =  pokemons;
    }
    if(search){
      result = result.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    }
    type ? result = result.filter((e) => e.types.includes(type)) : result =  result;
    result = result.slice(offset, offset + limit);
    res.status(200).send(result)
  } catch (error) {
    next(error);
  }
})


router.get("/:pokemonId",(req,res,next)=>{
  try{
    const { pokemonId }=req.params
    let db = fs.readFileSync("routes/db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    console.log(pokemons.length)
    let getpokemonid = {"pokemon":[],"nextPokemon":[],"previousPokemon":[]}
    Number.parseInt(pokemonId) === (pokemons.length) ? getpokemonid.nextPokemon = pokemons.find(pokemon=>Number.parseInt (pokemon.id)===1) : getpokemonid.nextPokemon = pokemons.find(pokemon=>Number.parseInt (pokemon.id)===Number.parseInt(pokemonId)+1)
    getpokemonid.pokemon =pokemons.find(pokemon=>pokemon.id===pokemonId)
    pokemonId === "1" ? getpokemonid.previousPokemon = pokemons.find(pokemon=>Number.parseInt (pokemon.id)===(pokemons.length)) : getpokemonid.previousPokemon =pokemons.find(pokemon=>Number.parseInt (pokemon.id)===Number.parseInt(pokemonId)-1)
    
    if(!getpokemonid){
      const exception = new Error(`pokemon not found`);
          exception.statusCode = 404;
    }
    db=JSON.stringify(db)
    fs.writeFileSync("routes/db.json",db)
      res.status(200).send(getpokemonid)
  }catch(error){
      next(error)
  }
  })

router.post("/addPokemon",(req,res,next)=>{
    try{
        let { name, id, url, types} = req.body;
    if(!id || !name || !types || !url ){
        const exception = new Error(`Missing body info`);
        exception.statusCode = 401;
        throw exception;
    }
    types = types.filter((e) => e != null)
    console.log(types)
    const newpokemon = {id, name, types, url};
let db = fs.readFileSync("routes/db.json", "utf-8");
db = JSON.parse(db);
const { pokemons } = db;

pokemons.push(newpokemon)
db.pokemons=pokemons
db= JSON.stringify(db)
fs.writeFileSync("routes/db.json",db)
    res.status(200).send(newpokemon)
    }catch(error){
        next(error)
    }
    })


router.put("/:pokemonId",(req,res,next)=>{
    try{
        const allowUpdate= [ "name","id","types","url",]

        const { pokemonId }=req.params

        const updates=req.body
        const updateKeys=Object.keys(updates)
        const notAllow = updateKeys.filter(el=>!allowUpdate.includes(el));

        if(notAllow.length){
        const exception = new Error(`Update field not allow`);
        exception.statusCode = 401;
        throw exception;
        }
let db = fs.readFileSync("routes/db.json", "utf-8");
db = JSON.parse(db);
const { pokemons } = db;
const targetIndex=pokemons.findIndex(pokemon=>pokemon.id===pokemonId)
console.log(targetIndex)
if(targetIndex < 0){
    const exception = new Error(`pokemon not found`);
        exception.statusCode = 404;
        throw exception;
}
const updatedpokemon={...db.pokemons[targetIndex],...updates}
db.pokemons[targetIndex]=updatedpokemon


db=JSON.stringify(db)
fs.writeFileSync("routes/db.json",db)
    res.status(200).send(updatedpokemon)
    }catch(error){
        next(error)
    }
    })


router.delete("/:pokemonId",(req,res,next)=>{
    try{
        const { pokemonId }=req.params
let db = fs.readFileSync("routes/db.json", "utf-8");
db = JSON.parse(db);
const { pokemons } = db;
const targetIndex=pokemons.findIndex(pokemon=>pokemon.id===pokemonId)
if(targetIndex < 0){
    const exception = new Error(`pokemon not found`);
        exception.statusCode = 404;
        throw exception;
}
db.pokemons = pokemons.filter(pokemon=>pokemon.id !== pokemonId)

db=JSON.stringify(db)
fs.writeFileSync("routes/db.json",db)
        res.status(200).send({})
        }catch(error){
            next(error)
        }
    })
module.exports= router