const axiosInstance = require("../lib/axios");
const { movie } = require("../models");
require("dotenv").config();

const getActor = async (movieId) => {
    try {
        const response = await axiosInstance.get(`/movie/${movieId}/credits`);
        const actors = response.data.cast
        return actors
            .filter(actor => actor.known_for_department === 'Acting')
            .slice(0, 5)
            .map(actor => actor.name).join(',');
    } catch (error) {
        return ''
    }
}

const movieExistsInDB = async (movieId) => {
    const movieExist = await movie.findOne({ where: { tmdbId: movieId } })
    return movieExist ? movieExist : false
}

const fetchMovieAndCastDetails = async (movieId) => {
    try {
        const response = await axiosInstance.get(`movie/${movieId}`)

        if (response.data.length === 0) {
            throw new Error(`error: ${response.data.error}, status: ${response.status}`)
        }

        let mov = response.data
        const cast = await getActor(movieId)
        const newMovie = await movie.create({
            title: mov?.title,
            tmdbId: mov?.id,
            genre: mov?.genres.map(g => g.name).join(', '),
            actors: cast,
            releaseYear: mov?.release_date ? mov?.release_date?.split('-')[0] : 0,
            rating: mov?.vote_average,
            description: mov?.overview
        })

        return newMovie;

    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw new Error('Failed to fetch movie details.');
    }

}



module.exports = { getActor, movieExistsInDB, fetchMovieAndCastDetails }