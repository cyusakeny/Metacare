const express = require('express')
const cors = require('cors')
const app = express()
const fetch = require('node-fetch')
const pool = require("./db")
const requestIp = require('request-ip')
const { stringify } = require('nodemon/lib/utils')
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());
app.get('/',(req,res)=>{
    res.send("Metacare")
})
app.get('/films',async(req,res)=>{
    try {
        const url ="https://swapi.py4e.com/api/films"
        const options ={
            "methods":"GET"
        }
        const poolPromise = pool.promise()
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
        const comments = await poolPromise.query("select * from comments where movie_id", [7],(error,result)=>{
            console.log(result)
        })
        for (const result of results) {
            let info ={
                title : result.title,
                opening_crawl:result.opening_crawl,
                release_date: result.release_date,
            }
            DataBody.push(info);
        }
        res.status(200).send(DataBody)    
    
    } catch (error) {
        console.error(error)
    }
    
})
app.get('/moviecharacters/:id/',async(req,res)=>{
    const sortBy = req.query.sortBy
    const order = req.query.order
    const id = req.params.id
    const filterBy = req.query.filterBy
    const url =`https://swapi.py4e.com/api/films/${id}`
    const options ={
        "methods":"GET"
    }
    const movie = await fetch(url,options).then(response=>response.text()).catch(e=>console.error("There was an error",e))
    const characters = JSON.parse(movie).characters
    let response=[]
    for (const character of characters) {
        const person = await fetch(character,options).then(res=>res.text()).catch(e=>console.error("There was an error",e))
       response.push(JSON.parse(person))    
    }
    if (filterBy) {
        response=response.filter(a=>a.gender==filterBy)
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
app.post("/comment/:id",async(req,res)=>{
    try {
    const movieId = req.params.id
    const comment = req.body.message
    const ip =requestIp.getClientIp(req)
const InsertInDb = await pool.query("INSERT into comments(UserIp,comment,movie_id) VALUES(?,?,?)",[ip,comment,parseInt(movieId)],
(error,results)=>{
    res.send(error)
}
);
res.send("Comment added")
} catch (error) {
        console.error(error.message);
    }
    
})
app.listen(port,()=> console.log(`Listening on port:${port}`))
