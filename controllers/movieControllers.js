const { validateCuratedList, validateRatingAndReview } = require("../validations")
const { curatedList, watchlist, wishlist, curatedListItem, review, movie } = require('../models')
const { generateSlug } = require("../service/serviceFunction")
const { getActor, movieExistsInDB, fetchMovieAndCastDetails, isMovieExistCuaratedListItem, isMovieExistInCuratedList } = require("./dataControllers")
const { Op, Model, where } = require("sequelize")
const axiosInstance = require("../lib/axios")
const { raw } = require("express")

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

        const isMovieExistIncuratedList = isMovieExistInCuratedList(curatedListId)
        if (!isMovieExistIncuratedList) {
            res.status(400).json({
                message: "curatedListId does not exist in db."
            })
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
            message: "curatedListId does not exist in db.",
            error: error.message
        })
    }
}

const addReviewsAndRatings = async (req, res) => {
    try {
        const { movieId } = req.params
        const { rating, reviewText } = req.body
        const errors = validateRatingAndReview(rating, reviewText)

        if (errors.length > 0) {
            return res.status(400).json({
                message: errors
            })
        }

        await review.create({
            movieId, rating, reviewText
        })

        res.status(200).json({
            message: 'Review added successfully.'
        })

    } catch (error) {
        res.status(500).json({
            message: "Error creating review.",
            error: error.message
        })
    }
}

const SearchMovieByGenreAndActor = async (req, res) => {
    try {
        const { genre, actor } = req.query

        if (!genre || !actor) {
            return res.status(400).json({ message: "Genre and actor are required!" });
        }

        const movies = await movie.findAll({
            where: {
                genre: { [Op.like]: `%${genre}%` },
                actors: { [Op.like]: `%${actor}%` }
            }
        })

        res.json({ movies });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching movie.",
            error: error.message
        })
    }
}

const sortMoviesByQuery = async (req, res) => {
    try {
        const { list, sortBy, order } = req.query

        const validLists = ["watchlist", "wishlist", "curatedListItem"]
        const validSortBy = ["rating", "releaseYear"]
        const validOrder = ["ASC", "DESC"]

        if (!validLists.includes(list)) res.status(400).json({ message: "Invalid list type" })
        if (!validSortBy.includes(sortBy)) res.status(400).json({ message: "Invalid sort parameter" })
        if (!validOrder.includes(order)) res.status(400).json({ message: "Invalid order(use ASC or DESC)" })

        const listModels = {
            watchlist,
            wishlist,
            curatedListItem,
        };

        const movies = await movie.findAll({
            include: {
                model: listModels[list],
                required: true,
                attributes: [],
            },
            order: [[sortBy, order]],
            attributes: [
                "id",
                "title",
                "tmdbId",
                "genre",
                "actors",
                "releaseYear",
                "rating"
            ],
        })

        res.json({ movies })

    } catch (error) {
        res.status(500).json({
            message: "Error fetching movie.",
            error: error.message
        })
    }
}


const fetchMoviesByTopRating = async (req, res) => {
    try {
        const topMovies = await movie.findAll({
            order: [["rating", 'DESC']],
            limit: 5,
            attributes: ["id", "title", "rating"]
        })

        const movieDetails = []
        for (const movie of topMovies) {
            const reviews = await review.findOne({
                where: { movieId: movie.id },
                attributes: ["reviewText"],
                raw: true
            })

            const wordCount = reviews ? reviews.reviewText.split(" ").length : 0

            movieDetails.push({
                title: movie.title,
                rating: movie.rating,
                reviews: {
                    text: reviews ? reviews.reviewText : "No review Available",
                    wordCount: wordCount,
                },
            })
        }
        res.json({ movies: movieDetails })

    } catch (error) {
        res.status(500).json({
            message: "Error fetching movie.",
            error: error.message
        })
    }
}

module.exports = { createCuratedLists, updateCuratedLists, searchMovies, createWatchlist, createWishlist, createCuratedListitem, addReviewsAndRatings, SearchMovieByGenreAndActor, sortMoviesByQuery, fetchMoviesByTopRating }