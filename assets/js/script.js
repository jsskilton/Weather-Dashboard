
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
  var errorContainer = $('#error-message');
  errorContainer.text(message);
  errorContainer.show();

  // Hide the error message after 2 seconds 
  setTimeout(function () {
    errorContainer.hide();
  }, 2000);
}

// Helper function to format time from timestamp
function formatTime(timestamp) {
  var date = new Date(timestamp * 1000);
  var hours = date.getHours().toString().padStart(2, '0');
  var minutes = date.getMinutes().toString().padStart(2, '0');
  return hours + ':' + minutes;
}

// Function to capitalise the first letter of each word
function capitaliseCity(city) {
  return city.toLowerCase().replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

// Function to get forecast from coordinates
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
      //For debugging
      console.log('Forecast API Response:', data); // Log the API response for debugging

      if (data.city && data.list && data.list.length > 0) {
        var todayData = data.list[0];
        var forecastHTML = '';
        var todayHTML = '';

        // Display today's weather information
        todayHTML +=
          '<div class="col-lg-12 today-weather">' +
          '<h2>' + data.city.name + ' - Today (' + new Date().toLocaleDateString('en-GB') + ')</h2>' +
          '<img src="https://openweathermap.org/img/w/' + todayData.weather[0].icon + '.png" alt="Weather Icon">' +
          '<p>Temperature: ' + todayData.main.temp + ' °C</p>' +
          '<p>Humidity: ' + todayData.main.humidity + '%</p>' +
          '<p>Wind Speed: ' + todayData.wind.speed + ' km/h</p>' +
          '<p>Time: ' + formatTime(todayData.dt) + '</p>' +
          '</div>';

        //Update the #today section with the new content
        $('#today').html(todayHTML);

        // Add subtitle for the Five Day Forecast
        forecastHTML += '<div class="col-lg-12 mt-2 mb-2"><h3>Five Day Forecast</h3></div>';

        //For debugging
        console.log('Number of items in data.list:', data.list.length);

        // Display the forecast for the next five days at 12 PM noon
        for (var i = 1; i <= 5; i++) {
          // Calculate the index for the forecast item
          var forecastIndex = i * 8 - 1; // Adjusted to get the last data point for each day

          console.log('Checking data for day ' + i, data.list[forecastIndex]);

          // Check if the required properties are available
          if (data.list[forecastIndex] && data.list[forecastIndex].dt && data.list[forecastIndex].weather && data.list[forecastIndex].main) {
            var forecastDate = new Date(data.list[forecastIndex].dt * 1000);
            var forecastDateFormatted = new Intl.DateTimeFormat('en-GB').format(forecastDate);
            var forecastIcon = data.list[forecastIndex].weather[0].icon;
            var forecastTemperature = data.list[forecastIndex].main.temp;
            var forecastHumidity = data.list[forecastIndex].main.humidity;
            var forecastWindSpeed = data.list[forecastIndex].wind.speed;
            
            // Construct HTML content for each day
            forecastHTML +=
              '<div class="col-lg-2 mb-3 forecast-weather">' +
              '<p><strong>' + forecastDateFormatted + '</strong></p>' +
              '<img src="https://openweathermap.org/img/w/' + forecastIcon + '.png" alt="Weather Icon">' +
              '<p>Temperature: ' + forecastTemperature + ' °C</p>' +
              '<p>Humidity: ' + forecastHumidity + '%</p>' +
              '<p>Wind Speed: ' + forecastWindSpeed + ' km/h</p>' +
              '<p>Time: ' + formatTime(data.list[forecastIndex].dt) + '</p>' +
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
  updateSearchHistory([]);
}

// Function to render search history on the page
function updateSearchHistory(searchHistory) {
  var historyList = $('#history');
  historyList.empty();

  searchHistory.forEach(function (city) {
    var listItem = $('<button>')
      .addClass('list-group-item list-group-item-action btn-secondary')
      .text(city)
      .on('click', function () {
        getCoordinates(city);
      });

    historyList.append(listItem);
  });
}

function addToHistory(city) {
  // Capitalise the city name before saving to local storage
  var capitalisedCity = capitaliseCity(city);

  // Get the existing search history from local storage or initialise an empty array
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  // Check if the city or capitalsed city is not already in the search history
  if (!searchHistory.includes(city) && !searchHistory.includes(capitalisedCity)) {
    // Add the new city to the search history
    searchHistory.push(capitalisedCity);

    // Save the updated search history back to local storage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Update the HTML with the new search history
    updateSearchHistory(searchHistory);

    console.log('Adding to history:', capitalisedCity);
  } else {
    console.log('City already exists in history:', capitalisedCity);
  }
}

// Function to load the search history from local storage
function loadHistory() {
  // Retrieve history from local storage
  var historyJSON = localStorage.getItem('searchHistory');

  // If history exists, parse it from JSON; otherwise, initialise an empty array
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
updateSearchHistory(initialSearchHistory);