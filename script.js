let cityInput = document.getElementById('city-input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = 'c050996d7aa3cb1470d58d120c0767d6',
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecastCard = document.querySelector('.day-forecast'),
    aqiCard = document.querySelectorAll('.highlights .card')[0],
    sunriseCard = document.querySelectorAll('.highlights .card')[1],
    hourlyForecastCard = document.querySelector('.hourly-forecast'),
    aqiList = ['GOOD', 'FAIR', 'MODERATE', 'POOR', 'VERY POOR'];

function getWeatherDetails(name, lat, lon, country, state) {
  let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
      WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
      AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ✅ Current Weather
  fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
    let date = new Date();
    currentWeatherCard.innerHTML = `
      <div class="current-weather">
        <div class="details">
          <p>Now</p>
          <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
          <p>${data.weather[0].description}</p>
        </div>
        <div class="weather-icon">
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
        </div>
      </div>
      <hr>
      <div class="card-footer">
        <p><i class="fa-solid fa-calendar-days"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}</p>
        <p><i class="fa-solid fa-location-dot"></i> ${name}, ${country}</p>
      </div>
    `;

    // ✅ Highlights
    document.getElementById('humidityVal').innerHTML = `${data.main.humidity}%`;
    document.getElementById('pressureyVal').innerHTML = `${data.main.pressure} hPa`;
    document.getElementById('visibilityVal').innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('windSpeedVal').innerHTML = `${data.wind.speed} m/s`;
    document.getElementById('feelsVal').innerHTML = `${(data.main.feels_like - 273.15).toFixed(2)}°C`;

    let { sunrise, sunset } = data.sys,
        { timezone } = data,
        sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
        sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

    sunriseCard.innerHTML = `
      <div class="card-head">
        <p>Sunrise & Sunset</p>
      </div>
      <div class="sunrise-sunset">
        <div class="item">
          <div class="icon">
            <i class="fa-light fa-sunrise fa-4x"></i>
          </div>
          <div>
            <p>Sunrise</p>
            <h2>${sRiseTime}</h2>
          </div>
        </div>
        <div class="item">
          <div class="icon">
            <i class="fa-light fa-sunset fa-4x"></i>
          </div>
          <div>
            <p>Sunset</p>
            <h2>${sSetTime}</h2>
          </div>
        </div>
      </div>
    `;
  }).catch(() => {
    alert("Failed to fetch current weather");
  });

  // ✅ Air Pollution
  fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
    let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;

    aqiCard.innerHTML = `
      <div class="card-head">
        <p>Air Quality Index</p>
        <p class="air-index aqi-${data.list[0].main.aqi}">
          ${aqiList[data.list[0].main.aqi - 1]}
        </p>
      </div>
      <div class="air-indices">
        <i class="fa-regular fa-wind fa-3x"></i>
        <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
        <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
        <div class="item"><p>SO₂</p><h2>${so2}</h2></div>
        <div class="item"><p>CO</p><h2>${co}</h2></div>
        <div class="item"><p>NO</p><h2>${no}</h2></div>
        <div class="item"><p>NO₂</p><h2>${no2}</h2></div>
        <div class="item"><p>NH₃</p><h2>${nh3}</h2></div>
        <div class="item"><p>O₃</p><h2>${o3}</h2></div>
      </div>
    `;
  }).catch(() => {
    alert("Failed to fetch air pollution data");
  });

  // ✅ Forecast
  fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
    // Hourly Forecast
    hourlyForecastCard.innerHTML = '';
    for (let i = 0; i <= 7; i++) {
      let hrForecastData = new Date(data.list[i].dt_txt);
      let hr = hrForecastData.getHours();
      let a = 'AM';
      if (hr >= 12) a = 'PM';
      if (hr === 0) hr = 12;
      if (hr > 12) hr -= 12;

      hourlyForecastCard.innerHTML += `
        <div class="card">
          <p>${hr} ${a}</p>
          <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="" class="fixingCloud">
          <p>${(data.list[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
        </div>
      `;
    }

    // 5-Day Forecast
    let uniqueForecastDays = [];
    let fiveDaysForecast = data.list.filter(forecast => {
      let forecastDate = new Date(forecast.dt_txt).getDate();
      if (!uniqueForecastDays.includes(forecastDate)) {
        uniqueForecastDays.push(forecastDate);
        return true;
      }
      return false;
    });

    fiveDaysForecastCard.innerHTML = '';
    for (let i = 1; i < fiveDaysForecast.length; i++) {
      let date = new Date(fiveDaysForecast[i].dt_txt);
      fiveDaysForecastCard.innerHTML += `
        <div class="forecast-item">
          <div class="icon-wrapper">
            <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
            <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
          </div>
          <p>${date.getDate()} ${months[date.getMonth()]}</p>
          <p>${days[date.getDay()]}</p>
        </div>
      `;
    }
  }).catch(() => {
    alert('Failed to fetch weather forecast');
  });
}

// ✅ City Search
function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = '';
  if (!cityName) return;

  let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
    if (!data || data.length === 0) {
      alert(`No coordinates found for "${cityName}"`);
      return;
    }
    let { name, lat, lon, country, state } = data[0];
    getWeatherDetails(name, lat, lon, country, state);
  }).catch(() => {
    alert(`Failed to fetch coordinates of ${cityName}`);
  });
}

// ✅ Live Location (Current Location)
function getUserCoordinates() {
  navigator.geolocation.getCurrentPosition(position => {
    let { latitude, longitude } = position.coords;
    let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

    fetch(REVERSE_GEOCODING_URL)
      .then(res => res.json())
      .then(data => {
        let { name, country, state } = data[0];
        getWeatherDetails(name, latitude, longitude, country, state);
      })
      .catch(() => {
        alert('Failed to fetch user coordinates');
      });
  }, () => {
    alert('Location access denied or unavailable.');
  });
}

// ✅ Event Listeners
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
window.addEventListener('load', getUserCoordinates);

