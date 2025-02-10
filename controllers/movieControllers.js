const { validateCuratedList } = require("../validations")
const { curatedList, watchlist, wishlist, curatedListItem } = require('../models')
const { generateSlug } = require("../service/serviceFunction")
const { getActor, movieExistsInDB, fetchMovieAndCastDetails, isMovieExistCuaratedListItem } = require("./dataControllers")

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

const createCuratedLists = async (req, res) => {
    try {
        const { name, description, slug } = req.body
        const errors = validateCuratedList(name, slug, description)
        if (errors) {
            return res.status(400).json({
                message: errors
            })
        }

        await curatedList.create({ name, description, slug })

        res.status(200).json({
            message: 'Curated list created successfully.'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error creating curated list.",
            error: error.message

        })
    }
}

const updateCuratedLists = async (req, res) => {
    try {
        const { curatedListId } = req.params;
        const { name, description } = req.body

        const slug = generateSlug(name)

        const errors = validateCuratedList(name, slug, description);

        if (errors) {
            return res.status(400).json({ message: errors });
        }

        const updateCuratedList = await curatedList.update(
            { name, description, slug }, { where: { id: curatedListId } }
        )

        if (updateCuratedList[0] === 0) {
            return res.status(404).json({ message: "Curated list not found." });
        }

        res.status(200).json({
            message: "Curated list updated successfully."
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error updating curated list."
        })
    }
}

const createWatchlist = async (req, res) => {
    try {
        const { movieId } = req.body

        if (!movieId) {
            return res.status(400).json({
                message: "Provide a valid MovieId."
            })
        }

        let movie = await movieExistsInDB(movieId)
        if (!movie) {
            movie = await fetchMovieAndCastDetails(movieId)
        }

        await watchlist.create({ movieId: movie.id })

        res.status(200).json({
            message: "Movie added to watchlist successfully."
        })

    } catch (error) {
        res.status(500).json({
            message: "Error creating Watchlist.",
            error: error.message
        })
    }
}

const createWishlist = async (req, res) => {
    try {
        const { movieId } = req.body

        if (!movieId) {
            return res.status(400).json({
                message: "Provide a valid MovieId."
            })
        }

        let movie = await movieExistsInDB(movieId)
        if (!movie) {
            movie = await fetchMovieAndCastDetails(movieId)
        }

        await wishlist.create({
            movieId: movie.id
        })

        res.status(200).json({
            message: "Movie added to wishlist successfully."
        })

    } catch (error) {
        res.status(500).json({
            message: "Error creating Wishlist.",
            error: error.message
        })
    }
}

const createCuratedListitem = async (req, res) => {
    try {
        const { movieId, curatedListId } = req.body
        if (!movieId || !curatedListId) {
            return res.status(400).json({
                message: "Provide a valid MovieId and curatedListId."
            })
        }

        let movie = await movieExistsInDB(movieId)
        if (!movie) {
            movie = await fetchMovieAndCastDetails(movieId)
        }

        const isMovie = await isMovieExistCuaratedListItem(movie.id, curatedListId)
        if (!isMovie) {
            await curatedListItem.create({
                movieId: movie.id,
                curatedListId: curatedListId
            })
        } else {
            return res.status(400).json({
                message: "Movie is already in the curated list."
            });
        }

        res.status(200).json({
            message: 'Movie added to curated list successfully.'
        })

    } catch (error) {
        res.status(500).json({
            message: "Error creating curatedlistitems.",
            error: error.message
        })
    }
}

module.exports = { createCuratedLists, updateCuratedLists, searchMovies, createWatchlist, createWishlist, createCuratedListitem }