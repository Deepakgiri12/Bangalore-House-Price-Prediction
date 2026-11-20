const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../client')));

const PORT = process.env.PORT || 3000;

const fs = require('fs');

const modelPath = path.join(__dirname, 'model_parameters.json');

const model = JSON.parse(
    fs.readFileSync(modelPath, 'utf8')
);

const dataColumns = model.data_columns;
const coefficients = model.coefficients;
const intercept = model.intercept;

app.get('/get_location_names', (req, res) => {

    const locations = dataColumns.slice(3);

    res.json({
        locations: locations
    });

});


function predictPrice(location, sqft, bath, bhk) {

    const input = new Array(dataColumns.length).fill(0);

    input[0] = sqft;
    input[1] = bath;
    input[2] = bhk;

    const locationIndex = dataColumns.indexOf(location);

    if (locationIndex === -1) {
        throw new Error('Invalid location');
    }

    input[locationIndex] = 1;

    let price = intercept;

    for (let i = 0; i < input.length; i++) {
        price += input[i] * coefficients[i];
    }

    return price;
}

app.post('/predict_home_price', (req, res) => {

    try {

        const { location, sqft, bath, bhk } = req.body;

        if (
            typeof location !== 'string' ||
            !location ||
            !Number.isFinite(sqft) ||
            !Number.isFinite(bath) ||
            !Number.isFinite(bhk) ||
            sqft <= 0 ||
            bath <= 0 ||
            bhk <= 0
        ) {
            return res.status(400).json({
                error: 'Please provide valid house details'
            });
        }

        const estimatedPrice = predictPrice(
            location,
            sqft,
            bath,
            bhk
        );

        res.json({
            estimated_price: estimatedPrice
        });

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }

});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
