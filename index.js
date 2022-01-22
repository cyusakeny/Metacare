const express = require('express'),
app = express();
const fetch = require('node-fetch')
const req = require('express/lib/request')
const { json } = require('express/lib/response')
const port = process.env.PORT || 3000;
app.get('/',(req,res)=>{
    res.send("Metacare")
})
app.get('/films',async(req,res)=>{
    const url ="https://swapi.py4e.com/api/films"
    const options ={
        "methods":"GET"
    }
    const movies = await fetch(url,options)
    .then(res=>res.text())
    .catch(e=>console.error("There was an error:",e))
    const results = JSON.parse(movies).results
    results.sort(function(a, b) {
        var c = new Date(a.release_date);
        var d = new Date(b.release_date);
        return c-d;
    });
    let DataBody =[]
    for (const result of results) {
        let info ={
            title : result.title,
            opening_crawl:result.opening_crawl,
            release_date: result.release_date
        }
        DataBody.push(info);
    }
    res.status(200).send(DataBody)
})
app.get('/moviecharacters/:id/',async(req,res)=>{
    const sortBy = req.query.sortBy
    const order = req.query.order
    const id = req.params.id
    const url =`https://swapi.py4e.com/api/films/${id}`
    const options ={
        "methods":"GET"
    }
    const movie = await fetch(url,options).then(response=>response.text()).catch(e=>console.error("There was an error",e))
    const characters = JSON.parse(movie).characters
    const response=[]
    for (const character of characters) {
        const person = await fetch(character,options).then(res=>res.text()).catch(e=>console.error("There was an error",e))
       response.push(JSON.parse(person))    
    }
    if(sortBy==="name"){
        response.sort(function(a, b){
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        })
    }
    else if(sortBy==="gender"){
        response.sort(function(a, b){
            if(a.gender < b.gender) { return -1; }
            if(a.gender > b.gender) { return 1; }
            return 0;
        })
    }
    else if(sortBy==="height"){
        response.sort(function(a, b){
            var c = parseFloat(a.height);
            var d = parseFloat(b.height);
            if (order==="descending") {
                c=parseFloat(b.height)
                d=parseFloat(a.height)
            }
            
            return c-d;
        })

    }
   
    res.send(response).status(201)
})
app.listen(port,()=> console.log(`Listening on port:${port}`))
