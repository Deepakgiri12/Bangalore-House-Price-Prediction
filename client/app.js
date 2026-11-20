// Get locations from backend

window.onload = function () {

    fetch('/get_location_names')

        .then(response => response.json())

        .then(data => {

            const locationSelect = document.getElementById('location');

            data.locations.forEach(location => {

                const option = document.createElement('option');

                option.value = location;
                option.text = location;

                locationSelect.appendChild(option);

            });

        });

};


// Send house details to backend

function predictPrice() {

    const location = document.getElementById('location').value;

    const sqft = Number(document.getElementById('sqft').value);

    const bhk = Number(document.getElementById('bhk').value);

    const bath = Number(document.getElementById('bath').value);


    fetch('/predict_home_price', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            location: location,
            sqft: sqft,
            bhk: bhk,
            bath: bath
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.error) {
            document.getElementById('result').innerText = data.error;
        } else {
            document.getElementById('result').innerText =
                'Estimated Price: ₹ ' + data.estimated_price.toFixed(2) + ' Lakhs';
        }

    })

    .catch(error => {
        console.error(error);
        document.getElementById('result').innerText = 'Something went wrong!';
    });

}