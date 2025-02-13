const express = require('express')
const cors = require('cors')
const { createCuratedLists, updateCuratedLists, searchMovies, createWatchlist, createWishlist, createCuratedListitem, addReviewsAndRatings, SearchMovieByGenreAndActor, sortMoviesByQuery, fetchMoviesByTopRating } = require('./controllers/movieControllers')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(cors())


app.get('/api/movies/search', searchMovies)
app.post('/api/curated-lists', createCuratedLists)
app.put('/api/curated-lists/:curatedListId', updateCuratedLists)
app.post('/api/movies/watchlist', createWatchlist)
app.post('/api/movies/wishlist', createWishlist)
app.post('/api/movies/curated-list', createCuratedListitem)
app.post('/api/movies/:movieId/reviews', addReviewsAndRatings)
app.get('/api/movies/searchByGenreAndActor', SearchMovieByGenreAndActor)
app.get('/api/movies/sort', sortMoviesByQuery)
app.get('/api/movies/top5', fetchMoviesByTopRating)


const PORT = 3000


app.listen(PORT, () => {
    console.log(`server listenning, http://localhost:${PORT}`)
})