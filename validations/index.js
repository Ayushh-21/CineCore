
const validateCuratedList = (name, description, slug) => {
    if (!name || typeof name !== "string") {
        return "Name is required and should be string."
    }

    if (!slug || typeof slug !== "string") {
        return "Slug is required and should be string."
    }

    return null
}


module.exports = { validateCuratedList }