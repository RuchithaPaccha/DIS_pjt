// Embedded JSON data for boats
var data = [
    { "Id": 1, "boatName": "Luxury Modern Yacht", "type": "Yacht", "length": 30, "minPrice": 2000, "maxPrice": 3000, "availability": "Yes" },
    { "Id": 2, "boatName": "Shamrock Yacht", "type": "Yacht", "length": 35, "minPrice": 2500, "maxPrice": 3500, "availability": "Yes" },
    { "Id": 3, "boatName": "Predator Yacht", "type": "Yacht", "length": 40, "minPrice": 3000, "maxPrice": 4000, "availability": "No" },
    { "Id": 4, "boatName": "Speedster Boat", "type": "Speedboat", "length": 20, "minPrice": 1000, "maxPrice": 1500, "availability": "Yes" },
    { "Id": 5, "boatName": "Comet Boat", "type": "Speedboat", "length": 25, "minPrice": 1500, "maxPrice": 2000, "availability": "No" },
    { "Id": 6, "boatName": "Wave Rider", "type": "Jet Ski", "length": 10, "minPrice": 500, "maxPrice": 1000, "availability": "Yes" },
    { "Id": 7, "boatName": "Sea Breeze", "type": "Jet Ski", "length": 12, "minPrice": 600, "maxPrice": 1100, "availability": "Yes" },
    { "Id": 8, "boatName": "Adventure Sailboat", "type": "Sailboat", "length": 30, "minPrice": 1800, "maxPrice": 2500, "availability": "Yes" },
    { "Id": 9, "boatName": "Explorer Sailboat", "type": "Sailboat", "length": 35, "minPrice": 2200, "maxPrice": 2800, "availability": "No" }
];

// Function to populate dropdowns
function populateDropdowns() {
    var boats = {};
    var lengths = {};
    var prices = {};

    // Collect unique boat names, lengths, and price ranges
    data.forEach(function (item) {
        boats[item.boatName] = true;
        lengths[item.length] = true;
        prices[item.minPrice + '-' + item.maxPrice] = true;
    });

    // Populate boat dropdown
    var boatSelect = document.getElementById('boatSelect');
    for (var boat in boats) {
        var option = document.createElement('option');
        option.text = boat;
        option.value = boat;
        boatSelect.add(option);
    }

    // Populate length dropdown
    var lengthSelect = document.getElementById('lengthSelect');
    for (var length in lengths) {
        var option = document.createElement('option');
        option.text = length + ' ft';
        option.value = length;
        lengthSelect.add(option);
    }

    // Populate price dropdown
    var priceSelect = document.getElementById('priceSelect');
    for (var price in prices) {
        var option = document.createElement('option');
        option.text = '$' + price;
        option.value = price;
        priceSelect.add(option);
    }
}

// Call function to populate dropdowns when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    populateDropdowns();
    updateTable(data); // Display initial data
});

// Function to update the boat information table
function updateTable(filteredData) {
    var tableBody = document.getElementById('boatInfoTable');
    tableBody.innerHTML = '';
    filteredData.forEach(function (item) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.boatName}</td>
            <td>${item.type}</td>
            <td>${item.length}</td>
            <td>${item.minPrice}</td>
            <td>${item.maxPrice}</td>
            <td>${item.availability}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Form submission handler
document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Fetch selected values from dropdowns
    var selectedBoat = document.getElementById('boatSelect').value;
    var selectedLength = document.getElementById('lengthSelect').value;
    var selectedPrice = document.getElementById('priceSelect').value.split('-').map(Number);

    // Filter data based on selected boat, length, and price range
    var filteredData = data.filter(function (item) {
        return item.boatName === selectedBoat || 
               item.length == selectedLength || 
               (item.minPrice >= selectedPrice[0] && item.maxPrice <= selectedPrice[1]);
    });

    // Update table with filtered data
    updateTable(filteredData);

    // Calculate average minPrice for the selected length and price range
    var totalPrice = 0;
    var count = 0;
    filteredData.forEach(function (item) {
        totalPrice += item.minPrice;
        count++;
    });
    var averageMinPrice = count > 0 ? totalPrice / count : 0;

    // Calculate quartiles for all boats
    var prices = data.map(function (item) {
        return item.minPrice;
    }).sort(function (a, b) {
        return a - b;
    });
    var q1 = quartile(prices, 0.25);
    var q2 = quartile(prices, 0.5);
    var q3 = quartile(prices, 0.75);

    // Calculate needle value based on average minPrice
    var needleValue = averageMinPrice;

    // Update gauge chart data and needle value
    var gaugeChart = window.myGauge;
    gaugeChart.data.datasets[0].data = [q1, q2, q3, Math.max.apply(null, prices)];
    gaugeChart.data.datasets[0].value = needleValue;
    gaugeChart.update();

    // Update bar chart data for min price comparison
    var barChart = window.myBar;
    barChart.data.labels = filteredData.map(item => item.boatName);
    barChart.data.datasets[0].data = filteredData.map(item => item.minPrice);
    barChart.update();

    // Update line chart data for boat length comparison
    var lineChart = window.myLine;
    lineChart.data.labels = filteredData.map(item => item.boatName);
    lineChart.data.datasets[0].data = filteredData.map(item => item.length);
    lineChart.update();

    // Update pie chart data for average price distribution
    var pieChart = window.myPie;
    var avgPrices = filteredData.map(item => (item.minPrice + item.maxPrice) / 2);
    var avgLabels = filteredData.map(item => item.boatName);
    pieChart.data.labels = avgLabels;
    pieChart.data.datasets[0].data = avgPrices;
    pieChart.update();
});

// Quartile calculation function
function quartile(arr, q) {
    var pos = (arr.length - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base]);
    } else {
        return arr[base];
    }
}

// Gauge chart configuration
var gaugeConfig = {
    type: 'gauge',
    data: {
        datasets: [{
            data: [0, 0, 0, 0],
            value: 0,
            backgroundColor: ['green', 'yellow', 'orange', 'red'],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Gauge Chart'
        },
        layout: {
            padding: {
                bottom: 30
            }
        },
        needle: {
            radiusPercentage: 2,
            widthPercentage: 3.2,
            lengthPercentage: 80,
            color: 'rgba(0, 0, 0, 1)'
        },
        valueLabel: {
            formatter: Math.round
        }
    }
};

// Create gauge chart
var gaugeCtx = document.getElementById('gaugeChart').getContext('2d');
window.myGauge = new Chart(gaugeCtx, gaugeConfig);

// Bar chart configuration
var barConfig = {
    type: 'bar',
    data: {
        labels: data.map(item => item.boatName),
        datasets: [{
            label: 'Min Price',
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1,
            data: data.map(item => item.minPrice)
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Min Price Comparison'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
};

// Create bar chart
var barCtx = document.getElementById('barChart').getContext('2d');
window.myBar = new Chart(barCtx, barConfig);

// Line chart configuration
var lineConfig = {
    type: 'line',
    data: {
        labels: data.map(item => item.boatName),
        datasets: [{
            label: 'Length',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            fill: false,
            data: data.map(item => item.length)
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Boat Length Comparison'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
};

// Create line chart
var lineCtx = document.getElementById('lineChart').getContext('2d');
window.myLine = new Chart(lineCtx, lineConfig);

// Pie chart configuration
var pieConfig = {
    type: 'pie',
    data: {
        labels: data.map(item => item.boatName),
        datasets: [{
            label: 'Average Price',
            backgroundColor: ['rgba(0, 123, 255, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(54, 162, 235, 0.5)'],
            borderColor: ['rgba(0, 123, 255, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
            data: data.map(item => (item.minPrice + item.maxPrice) / 2)
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Average Price Distribution'
        }
    }
};

// Create pie chart
var pieCtx = document.getElementById('pieChart').getContext('2d');
window.myPie = new Chart(pieCtx, pieConfig);
