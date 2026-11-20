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

        // 1. Basic input validation
        if (
            typeof location !== 'string' ||
            !location.trim() ||
            !Number.isFinite(sqft) ||
            !Number.isFinite(bath) ||
            !Number.isFinite(bhk)
        ) {
            return res.status(400).json({
                error: 'Please provide valid house details'
            });
        }

        // 2. Realistic value validation
        if (
            sqft < 300 || sqft > 10000 ||
            bhk < 1 || bhk > 10 ||
            bath < 1 || bath > 10
        ) {
            return res.status(400).json({
                error: 'Please enter realistic house details'
            });
        }

        // 3. Predict price
        const estimatedPrice = predictPrice(
            location,
            sqft,
            bath,
            bhk
        );

        // 4. Prediction validation
        if (!Number.isFinite(estimatedPrice) || estimatedPrice <= 0) {
            return res.status(400).json({
                error: 'Unable to predict a valid price for these inputs'
            });
        }

        // 5. Send successful response
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
