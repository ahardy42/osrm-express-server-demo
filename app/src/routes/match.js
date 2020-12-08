const express = require("express");
const logfmt = require("logfmt");

const router = express.Router();

router.post("/", (req, res) => {
    if (!req.body.coordinates) {
        return res.status(422).json({ error: "Missing coordinates" });
    }

    const osrm = req.app.get("osrm");
    const options = {
        coordinates: req.body.coordinates,
        // Limits the search to segments with given bearing in degrees towards true north
        // in clockwise direction
        bearings: req.body.bearings || null,
        // Returned route geometry format (influences overview and per step).
        geometries: req.body.geometries || 'geojson',
        // Add overview geometry
        overview: req.body.overview || 'simplified',
        // Timestamp of the input location (integers, UNIX-like timestamp
        timestamps: req.body.timestamps || null,
        // Standard deviation of GPS precision used for map matching.
        radiuses: req.body.radiuses || null,
        // Allows the input track splitting based on huge timestamp gaps between
        // points. Either split or ignore
        gaps: req.body.gaps || 'ignore',
        // Allows the input track modification to obtain better matching quality
        // for noisy tracks
        tidy: req.body.tidy || false,
    }

    try {
        osrm.match(options, (err, response) => {
            if (err) return res.status(422).json({ error: err.message });
            return res.json(response);
        })
    } catch (err) {
        logfmt.error(new Error(err.message));
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;