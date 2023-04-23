import express from "express";
import Fuse from "fuse.js";
import fs from "fs";
import path from "path";

const app = express();

const citiesJson = JSON.parse(fs.readFileSync(path.join(__dirname, './cities.json')).toString());

interface City {
    name: string;
    country: string;
    lat: string;
    lng: string;
}

// Initialize cities index
const cities = new Fuse<City>(citiesJson, {
    isCaseSensitive: false,
    keys: [
    {
        name: 'name',
        weight: 2
    },
    {
        name: 'country',
        weight: 1
    }
],
    shouldSort: true,
    threshold: 0.3,
    findAllMatches: false
});

app.get('/api/v1/geolocation', async (req, res) => {
    const city = req.query.city;
    const country = req.query.country ?? '';

    if (!city && !country) {
        return res.status(200).send([]);
    }

    if (typeof city !== 'string' || typeof country !== 'string') {
        return res.status(200).send([]);
    }

    const foundCities = cities.search({
        $or: [
            {
                name: city
            },
            {
                country
            }
        ]
    });

    for (const foundCity of foundCities) {
        if (foundCity.item.name.toLowerCase() === city) {
            return res.status(200).send([foundCity]);
        }
    }

    return res.status(200).send(foundCities.slice(0, 3));
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});