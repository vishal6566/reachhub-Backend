const express = require("express");


const { topPlayers, fetchLast30DaysRating, convertToCsvfile } = require("../controller/playersController");

const router = express.Router();


router.route("/top-players").get(topPlayers);
router.route("/player/:username/rating-history").get(fetchLast30DaysRating)
router.route("/players/rating-history-csv").get(convertToCsvfile)
module.exports = router;