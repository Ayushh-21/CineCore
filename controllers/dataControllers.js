const axiosInstance = require("../lib/axios")
require("dotenv").config();

const getActor = async (movieId) => {
    try {
        const response = await axiosInstance.get(`/movie/${movieId}/credits`);
        const actors = response.data.cast
        return actors
            .filter(actor => actor.known_for_department === 'Acting')
            .map(actor => actor.name).join(',');
    } catch (error) {
        return []
    }
}

const searchMovies = async (req, res) => {
    try {
        const { query } = req.query
        const response = await axiosInstance.get(`/search/movie?query=${query}`);

        if (response.data.length === 0) {
            res.status(404).json({
                message: "No movies available with this query."
            })
        }

        const movies = response.data.results
        const extractedData = await Promise.all(
            movies.map(async movie => {
                return {
                    title: movie.original_title || "N/A",
                    tmdbId: movie.id || "N/A",
                    genre: movie.genre_ids || "N/A",
                    actors: await getActor(movie.id) || "N/A",
                    releaseYear: movie.release_date ? movie.release_date.split('-')[0] : "N/A",
                    rating: movie.vote_average || "N/A",
                    description: movie.overview || "N/A"
                }
            }))
        res.json({ movies: extractedData })
    } catch (error) {
        res.status(500).json({
            error: error.message,
            message: "Error fetching movies."
        })
    }
}



module.exports = { searchMovies }