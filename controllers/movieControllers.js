const { validateCuratedList } = require("../validations")
const { curatedList } = require('../models')

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
            message: "Error creating curated list."
        })
    }
}



module.exports = { createCuratedLists }