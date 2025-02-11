
const validateCuratedList = (name, description, slug) => {
    if (!name || typeof name !== "string") {
        return "Name is required and should be string."
    }

    if (!description || typeof description !== "string") {
        return "Description is required and should be string."
    }

    if (!slug || typeof slug !== "string") {
        return "Slug is required and should be string."
    }

    return null
}

const validateRatingAndReview = (rating, reviewText) => {
    const errors = []
    if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 10) {
        errors.push("Rating must be a float between 0 and 10.");
    }

    if (typeof reviewText !== 'string' || reviewText.length > 500) {
        errors.push("Review text must be a maximum of 500 characters.");
    }

    return errors
}


module.exports = { validateCuratedList, validateCuratedList, validateRatingAndReview }