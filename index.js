const express = require('express')
const cors = require('cors')
const { searchMovies } = require('./controllers/dataControllers')
const { createCuratedLists } = require('./controllers/movieControllers')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(cors())


app.get('/api/movies/search', searchMovies)
app.post('/api/curated-lists', createCuratedLists)



const PORT = 3000


app.listen(PORT, () => {
    console.log(`server listenning, http://localhost:${PORT}`)
})