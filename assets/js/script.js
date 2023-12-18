
'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=2f21b22e559d375fd1d489821b2f3ac1'
const apiKey = '2f21b22e559d375fd1d489821b2f3ac1';

// Function to get coordinates for a city
function getCoordinates(city) {
  var geocodingURL =
    'https://api.openweathermap.org/geo/1.0/direct?q=' +
    city +
    '&limit=1' +
    '&appid=' +
    apiKey;

  fetch(geocodingURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.length > 0) {
        var latitude = data[0].lat;
        var longitude = data[0].lon;

        // Once we have the coordinates, can call the 5 day forecast API
        getForecast(latitude, longitude);

        // Add the city to the search history if valid city
        addToHistory(city);
      } else {
        console.error('Error getting coordinates for the city:', city);
        // Display an error message on the screen
        console.log('test');
        displayErrorMessage('Invalid city. Please enter a valid city name.');
      }
      
    })
    .catch(function (error) {
      console.error('Error fetching coordinates:', error);
    });
}

// Function to display an error message on the screen
function displayErrorMessage(message) {
    // You can customize this part based on your UI structure
    var errorContainer = $('#error-message');
    errorContainer.text(message);
    errorContainer.show();

    // Hide the error message after a brief duration (e.g., 3 seconds)
    setTimeout(function () {
        errorContainer.hide();
    }, 3000);
}

// Helper function to format time from timestamp
function formatTime(timestamp) {
  var date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', hour12: true });
}

function getForecast(latitude, longitude) {

  var forecastURL =
    'https://api.openweathermap.org/data/2.5/forecast?lat=' +
    latitude +
    '&lon=' +
    longitude +
    '&appid=' +
    apiKey +
    '&units=metric';

  fetch(forecastURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log('Forecast API Response:', data); // Log the API response for debugging

      if (data.city && data.list && data.list.length > 0) {
        var todayData = data.list[0];
        var forecastHTML = '';

        // Display today's weather information
        forecastHTML +=
          '<div class="col-lg-12">' +
          '<h2>' + data.city.name + ' - Today</h2>' +
          '<img src="https://openweathermap.org/img/w/' + todayData.weather[0].icon + '.png" alt="Weather Icon">' +
          '<p>Temperature: ' + todayData.main.temp + ' °C</p>' +
          '<p>Humidity: ' + todayData.main.humidity + '%</p>' +
          '<p>Wind Speed: ' + todayData.wind.speed + ' km/h</p>' +
          '<p>Time: ' + formatTime(todayData.dt) + '</p>' +
          '</div>';

        // Display the forecast for the next five days at 12 PM noon
        for (var i = 0; i <= 5; i++) {
          // Check if the required properties are available
          if (data.list[i * 8] && data.list[i * 8].dt && data.list[i * 8].weather && data.list[i * 8].main) {
            var forecastDate = new Date(data.list[i * 8].dt * 1000);
            var forecastDateFormatted = new Intl.DateTimeFormat('en-GB').format(forecastDate);
            var forecastIcon = data.list[i * 8].weather[0].icon;
            var forecastTemperature = data.list[i * 8].main.temp;
            var forecastHumidity = data.list[i * 8].main.humidity;
            var forecastWindSpeed = data.list[i * 8].wind.speed;

            // Construct HTML content for each day
            forecastHTML +=
              '<div class="col-lg-2 mb-3">' +
              '<p>' + forecastDateFormatted + '</p>' +
              '<img src="https://openweathermap.org/img/w/' + forecastIcon + '.png" alt="Weather Icon">' +
              '<p>Temperature: ' + forecastTemperature + ' °C</p>' +
              '<p>Humidity: ' + forecastHumidity + '%</p>' +
              '<p>Wind Speed: ' + forecastWindSpeed + ' km/h</p>' +
              '<p>Time: ' + formatTime(data.list[i * 8].dt) + '</p>' +
              '</div>';
          }
        }

        // Update the #forecast section with the new content
        $('#forecast').html(forecastHTML);
      } else {
        console.error('Error: Invalid forecast data in API response');
      }
    })
    .catch(function (error) {
      console.error('Error fetching forecast data:', error);
    });
}

// Function to clear the search history
function clearHistory() {
  localStorage.removeItem('searchHistory');
  updateSearchHistoryUI([]);
}

// Function to render search history on the page
function updateSearchHistoryUI(searchHistory) {
  var historyList = $('#history');
  historyList.empty();  // Clear the existing list

  searchHistory.forEach(function (city) {
    var listItem = $('<button>')
      .addClass('list-group-item list-group-item-action')
      .text(city)
      .on('click', function () {
        getCoordinates(city);
      });

    historyList.append(listItem);
  });
}

function addToHistory(city) {
  // Get the existing search history from local storage or initialize an empty array
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  // Check if the city is not already in the search history
  if (!searchHistory.includes(city)) {
    // Add the new city to the search history
    searchHistory.push(city);

    // Save the updated search history back to local storage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Update the HTML with the new search history
    updateSearchHistoryUI(searchHistory);

    console.log('Adding to history:', city);
  } else {
    console.log('City already exists in history:', city);
  }
}

// Function to load the search history from local storage
function loadHistory() {
  // Retrieve history from local storage
  var historyJSON = localStorage.getItem('searchHistory');

  // If history exists, parse it from JSON; otherwise, initialize an empty array
  var history = historyJSON ? JSON.parse(historyJSON) : [];

  return history;
}

// Event listener for the "Clear History" button
$('#clear-history-button').on('click', clearHistory);

// Event listener for the search form submission
$('#search-form').submit(function (event) {
  event.preventDefault();
  var city = $('#search-input').val().trim();

  if (city !== '') {
    getCoordinates(city);
  }
});

// Load search history on page load and render buttons
var initialSearchHistory = loadHistory();
updateSearchHistoryUI(initialSearchHistory);

// Example: Display weather for the first city in the search history
if (initialSearchHistory.length > 0) {
    getCoordinates(initialSearchHistory[0]);
}