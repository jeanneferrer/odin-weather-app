/* eslint-disable no-promise-executor-return */
async function getWeatherData(place) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${`${place}`}&APPID=73889806f64e18557c1f63e3e3848d52`, { mode: 'cors' });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    return error;
  }
}

// from https://www.pexels.com/
async function getPlacePhoto(place) {
  const response = await fetch(`https://api.pexels.com/v1/search?query=${place}`, {
    headers: {
      Authorization: 'CEbgNVhYIhchT2LX5hZBh2FIsJGL9wIRXdoJA6EK2CEhaHhYfcOkrJ4G',
    },
  });
  const responseData = await response.json();
  return responseData;
}

// from GIPHY API
async function getGif(word) {
  const img = document.querySelector('#gif');
  try {
    const response = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=UigmyZmNmrrgF3BJQXF56laRlkgAkzmi&s=${word}`, { mode: 'cors' });
    const responseData = await response.json();
    img.src = responseData.data.images.original.url;
  } catch (error) {
    img.src = '';
  }
}

// {"coord":{"lon":2.159,"lat":41.3888},
// "weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],
// "base":"stations",
// "main":{"temp":284.96,"feels_like":284.23,"temp_min":283.81,
// "temp_max":286.11,"pressure":1018,"humidity":78},
// "visibility":10000,
// "wind":{"speed":2.06,"deg":330},
// "clouds":{"all":20},
// "dt":1678838210,
// "sys":{"type":2,"id":18549,"country":"ES","sunrise":1678860240,"sunset":1678903015},
// "timezone":3600,"id":3128760,"name":"Barcelona","cod":200}

async function processWeatherData(place) {
  const container = document.querySelector('#weather-container');
  const error = document.querySelector('#error-page');
  const loadingPage = document.getElementById('loading-page');
  container.style.display = 'none';
  container.style.opacity = 0;
  error.style.display = 'none';
  error.style.opacity = 0;
  loadingPage.style.display = 'flex';
  loadingPage.style.opacity = 1;
  const [weatherData, img] = await Promise.all([getWeatherData(place), getPlacePhoto(place)]);
  if (weatherData.message) {
    const errorGif = await getGif('cat');
    const errorText = document.querySelector('#error-page p');
    errorText.textContent = `Oops, '${place}' not found. Have a cat gif and try again!`;
    await new Promise((resolve) => setTimeout(() => {
      setTimeout(() => {
        loadingPage.style.opacity = 0;
        loadingPage.style.display = 'none';
      }, 1000);
      setTimeout(() => {
        error.style.opacity = 1;
        error.style.display = 'flex';
      }, 1000);
      resolve();
    }, 3000));
    return weatherData;
  }
  await new Promise((resolve) => setTimeout(() => {
    setTimeout(() => {
      loadingPage.style.opacity = 0;
      loadingPage.style.display = 'none';
    }, 1000);
    setTimeout(() => {
      container.style.opacity = 1;
      container.style.display = 'flex';
    }, 1000);
    resolve();
  }, 3000));
  const weather = {
    place: weatherData.name,
    lon: weatherData.coord.lon,
    lat: weatherData.coord.lat,
    temp: weatherData.main.temp - 273.15,
    feels_like: weatherData.main.feels_like - 273.15,
    temp_min: weatherData.main.temp_min - 273.15,
    temp_max: weatherData.main.temp_max - 273.15,
    dt: weatherData.dt,
    timezone: weatherData.timezone,
    sunrise: weatherData.sys.sunrise,
    sunset: weatherData.sys.sunset,
    photo: img.photos[0].src.landscape,
  };
  localStorage.setItem('currentPlace', weatherData.name);
  return weather;
}

export default processWeatherData;
