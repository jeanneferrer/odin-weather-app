import './styles.css';
import processWeatherData from './weather';
import cat from './assets/cat-face.svg';
import sunriseIcon from './assets/sunrise.svg';
import sunsetIcon from './assets/sunset.svg';
import thermometerIcon from './assets/thermometer.svg';

// convert temperature from Celsius to Fahrenheit and vice versa
function convertTemp(temp, isCelsius) {
  if (isCelsius) {
    return `${Math.round(temp * (9 / 5) + 32)}°F`;
  }
  return `${Math.round((temp - 32) * (5 / 9))}°C`;
}

function changeTheme(isDay) {
  if (isDay) document.body.setAttribute('data-theme', 'light');
  else document.body.setAttribute('data-theme', 'dark');
}

/**
 * @param {*} time : time as a Date object
 * @param {*} tz : timezone offset in UTC seconds
 */
function convertTime(time, tz) {
  const localTime = time.getTime();
  const localOffset = time.getTimezoneOffset() * 60000;
  const utc = localTime + localOffset;
  const converted = utc + (1000 * tz);
  return new Date(converted);
}

// countinuous clock depending on timezone
let timeoutHandle;
function worldClock(tz) {
  const clockText = document.getElementById('clock');
  const date = convertTime(new Date(), tz);
  let hh = date.getHours();
  let mm = date.getMinutes();
  let ss = date.getSeconds();

  hh = (hh < 10) ? `0${hh}` : hh;
  mm = (mm < 10) ? `0${mm}` : mm;
  ss = (ss < 10) ? `0${ss}` : ss;

  const time = `${hh}:${mm}:${ss}`;
  clockText.textContent = time;
}

function timeToString(time) {
  return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
}

function insertWeatherInfo(data) {
  const header = document.getElementById('header-hero');
  const cityName = document.getElementById('city-name');
  const lonSpan = document.getElementById('lon');
  const latSpan = document.getElementById('lat');
  const cityTemp = document.getElementById('city-temp');
  const feelsLike = document.getElementById('feels-like');
  const tempMin = document.getElementById('temp-min');
  const tempMax = document.getElementById('temp-max');
  const value1 = feelsLike.querySelector('span');
  const value2 = tempMin.querySelector('span');
  const value3 = tempMax.querySelector('span');
  const sunrise = document.getElementById('sunrise-time');
  const sunset = document.getElementById('sunset-time');
  const sunriseGMT = document.getElementById('sunrise-gmt-time');
  const sunsetGMT = document.getElementById('sunset-gmt-time');
  if (data.message) {
    header.style.background = '';
    cityName.textContent = data.message;
    lonSpan.textContent = '-';
    latSpan.textContent = '-';
    cityTemp.textContent = '-';
    value1.textContent = '-';
    value2.textContent = '-';
    value3.textContent = '-';
    sunrise.textContent = '-';
    sunset.textContent = '-';
    sunriseGMT.textContent = '-';
    sunsetGMT.textContent = '-';
    return;
  }
  header.style.backgroundImage = `url('${data.photo}')`;
  cityName.innerHTML = data.place;
  lonSpan.textContent = data.lon;
  latSpan.textContent = data.lat;
  if (localStorage.getItem('isCelsius') === null || JSON.parse(localStorage.getItem('isCelsius')) === true) {
    if (localStorage.getItem('isCelsius') === null) {
      localStorage.setItem('isCelsius', true);
    }
    cityTemp.textContent = `${Math.round(data.temp)}°C`;
    value1.textContent = `${Math.round(data.feels_like)}°C`;
    value2.textContent = `${Math.round(data.temp_min)}°C`;
    value3.textContent = `${Math.round(data.temp_max)}°C`;
  } else {
    cityTemp.textContent = convertTemp(data.temp, true);
    value1.textContent = convertTemp(data.feels_like, true);
    value2.textContent = convertTemp(data.temp_min, true);
    value3.textContent = convertTemp(data.temp_max, true);
  }
  const sunriseTimeLocal = new Date(data.sunrise * 1000);
  const sunsetTimeLocal = new Date(data.sunset * 1000);
  sunrise.textContent = timeToString(sunriseTimeLocal);
  sunset.textContent = timeToString(sunsetTimeLocal);
  sunriseGMT.textContent = timeToString(convertTime(sunriseTimeLocal, data.timezone));
  sunsetGMT.textContent = timeToString(convertTime(sunsetTimeLocal, data.timezone));

  // changes theme based on time of day (in the timezone)
  const x = new Date();
  changeTheme(x.getHours() >= sunriseTimeLocal.getHours()
              || x.getHours() <= sunsetTimeLocal.getHours());
  timeoutHandle = window.setInterval(() => worldClock(data.timezone), 1000);
}

// form
const form = document.createElement('form');
const input = document.createElement('input');
input.setAttribute('type', 'text');
input.setAttribute('placeholder', 'Search for a city...');
const button = document.createElement('button');
button.setAttribute('type', 'submit');
button.textContent = 'Search';
form.appendChild(input);
form.appendChild(button);
form.addEventListener('submit', (e) => {
  window.clearInterval(timeoutHandle);
  e.preventDefault();
  const place = input.value;
  if (place === '') {
    return;
  }
  const weatherData = processWeatherData(place);
  weatherData.then((data) => {
    insertWeatherInfo(data);
  }).catch((error) => error);

  input.value = '';
});
document.body.appendChild(form);

// loading component
const loadingPage = document.createElement('div');
loadingPage.setAttribute('id', 'loading-page');
const loadingImage = new Image();
loadingImage.src = cat;
const loadingText = document.createElement('p');
loadingText.textContent = 'Loading...';
loadingPage.appendChild(loadingImage);
loadingPage.appendChild(loadingText);
document.body.appendChild(loadingPage);

const weatherContainer = document.createElement('div');
weatherContainer.setAttribute('id', 'weather-container');

// first hero row
const headerHero = document.createElement('div');
headerHero.setAttribute('id', 'header-hero');
const clock = document.createElement('div');
clock.setAttribute('id', 'clock');
const h1 = document.createElement('h1'); // city name
h1.setAttribute('id', 'city-name');
const lonDiv = document.createElement('div'); // longitude
lonDiv.textContent = 'Longitude: ';
const lonSpan = document.createElement('span');
lonSpan.setAttribute('id', 'lon');
lonDiv.appendChild(lonSpan);
const latDiv = document.createElement('div'); // latitude
latDiv.textContent = 'Latitude: ';
const latSpan = document.createElement('span');
latSpan.setAttribute('id', 'lat');
latDiv.appendChild(latSpan);
headerHero.appendChild(clock);
headerHero.appendChild(h1);
headerHero.appendChild(lonDiv);
headerHero.appendChild(latDiv);
weatherContainer.appendChild(headerHero);

// second hero row
const moreInfoHero = document.createElement('div');
// temperature section
const tempHero = document.createElement('div');
// main temperature
const mainTempDiv = document.createElement('div'); // main temperature and convert button
mainTempDiv.setAttribute('id', 'main-temp');
const mainTempHeader = document.createElement('p');
const mainTempIcon = new Image();
mainTempIcon.src = thermometerIcon;
mainTempHeader.appendChild(mainTempIcon);
const cityTemp = document.createElement('span');
cityTemp.setAttribute('id', 'city-temp');
mainTempHeader.appendChild(cityTemp);
const convertBtn = document.createElement('button');
convertBtn.setAttribute('id', 'convert');
convertBtn.textContent = localStorage.getItem('isCelsius') === null || JSON.parse(localStorage.getItem('isCelsius')) === true ? 'Convert to F' : 'Convert to C';
mainTempDiv.appendChild(mainTempHeader);
mainTempDiv.appendChild(convertBtn);
// other temperature info
const otherTempDiv = document.createElement('div'); // other temperature info
otherTempDiv.setAttribute('id', 'other-temp');
const feelsLikeDiv = document.createElement('div'); // feels like
feelsLikeDiv.setAttribute('id', 'feels-like');
feelsLikeDiv.textContent = 'Feels Like';
const value1 = document.createElement('span');
feelsLikeDiv.appendChild(value1);
const tempMinDiv = document.createElement('div'); // min temp
tempMinDiv.setAttribute('id', 'temp-min');
tempMinDiv.textContent = 'Min. Temp';
const value2 = document.createElement('span');
tempMinDiv.appendChild(value2);
const tempMaxDiv = document.createElement('div'); // max temp
tempMaxDiv.setAttribute('id', 'temp-max');
tempMaxDiv.textContent = 'Max. Temp';
const value3 = document.createElement('span');
tempMaxDiv.appendChild(value3);
convertBtn.addEventListener('click', () => {
  if (convertBtn.textContent === 'Convert to F') {
    convertBtn.textContent = 'Convert to C';
    localStorage.setItem('isCelsius', false);
    cityTemp.textContent = convertTemp(Number(cityTemp.textContent.split('°')[0]), true);
    value1.textContent = convertTemp(Number(value1.textContent.split('°')[0]), true);
    value2.textContent = convertTemp(Number(value2.textContent.split('°')[0]), true);
    value3.textContent = convertTemp(Number(value3.textContent.split('°')[0]), true);
  } else {
    convertBtn.textContent = 'Convert to F';
    localStorage.setItem('isCelsius', true);
    cityTemp.textContent = convertTemp(Number(cityTemp.textContent.split('°')[0]), false);
    value1.textContent = convertTemp(Number(value1.textContent.split('°')[0]), false);
    value2.textContent = convertTemp(Number(value2.textContent.split('°')[0]), false);
    value3.textContent = convertTemp(Number(value3.textContent.split('°')[0]), false);
  }
});
otherTempDiv.appendChild(feelsLikeDiv);
otherTempDiv.appendChild(tempMinDiv);
otherTempDiv.appendChild(tempMaxDiv);
tempHero.appendChild(mainTempDiv);
tempHero.appendChild(otherTempDiv);
moreInfoHero.appendChild(tempHero);

// sunrise and sunset times section
const sunriseSunsetHero = document.createElement('div');
sunriseSunsetHero.setAttribute('id', 'sunrise-sunset-hero');
// local times
const localTimesDiv = document.createElement('div');
const sunriseDiv = document.createElement('div');
sunriseDiv.setAttribute('class', 'more-info');
const sunriseLocalIcon = new Image();
sunriseLocalIcon.src = sunriseIcon;
sunriseLocalIcon.setAttribute('class', 'sunrise-icon');
const sunriseTimeText = document.createElement('div');
const sunriseTimeTitle = document.createElement('p');
sunriseTimeTitle.textContent = 'Sunrise (local time): ';
const sunriseTime = document.createElement('span');
sunriseTime.setAttribute('id', 'sunrise-time');
sunriseTimeText.appendChild(sunriseTimeTitle);
sunriseTimeText.appendChild(sunriseTime);
sunriseDiv.appendChild(sunriseLocalIcon);
sunriseDiv.appendChild(sunriseTimeText);
const sunsetDiv = document.createElement('div');
sunsetDiv.setAttribute('class', 'more-info');
const sunsetLocalIcon = new Image();
sunsetLocalIcon.src = sunsetIcon;
sunsetLocalIcon.setAttribute('class', 'sunset-icon');
const sunsetTimeText = document.createElement('div');
const sunsetTimeTitle = document.createElement('p');
sunsetTimeTitle.textContent = 'Sunset (local time): ';
const sunsetTime = document.createElement('span');
sunsetTime.setAttribute('id', 'sunset-time');
sunsetTimeText.appendChild(sunsetTimeTitle);
sunsetTimeText.appendChild(sunsetTime);
sunsetDiv.appendChild(sunsetLocalIcon);
sunsetDiv.appendChild(sunsetTimeText);
localTimesDiv.appendChild(sunriseDiv);
localTimesDiv.appendChild(sunsetDiv);
sunriseSunsetHero.appendChild(localTimesDiv);
// converted times
const convertedTimesDiv = document.createElement('div');
const sunriseConvertedDiv = document.createElement('div');
sunriseConvertedDiv.setAttribute('class', 'more-info');
const sunriseConvertedIcon = new Image();
sunriseConvertedIcon.src = sunriseIcon;
sunriseConvertedIcon.setAttribute('class', 'sunrise-icon');
const sunriseConvertedText = document.createElement('div');
const sunriseConvertedTitle = document.createElement('p');
sunriseConvertedTitle.textContent = 'Sunrise (GMT): ';
const sunriseConvertedTime = document.createElement('span');
sunriseConvertedTime.setAttribute('id', 'sunrise-gmt-time');
sunriseConvertedText.appendChild(sunriseConvertedTitle);
sunriseConvertedText.appendChild(sunriseConvertedTime);
sunriseConvertedDiv.appendChild(sunriseConvertedIcon);
sunriseConvertedDiv.appendChild(sunriseConvertedText);
const sunsetConvertedDiv = document.createElement('div');
sunsetConvertedDiv.setAttribute('class', 'more-info');
const sunsetConvertedIcon = new Image();
sunsetConvertedIcon.src = sunsetIcon;
sunsetConvertedIcon.setAttribute('class', 'sunset-icon');
const sunsetConvertedText = document.createElement('div');
const sunsetConvertedTitle = document.createElement('p');
sunsetConvertedTitle.textContent = 'Sunset (GMT): ';
const sunsetConvertedTime = document.createElement('span');
sunsetConvertedTime.setAttribute('id', 'sunset-gmt-time');
sunsetConvertedText.appendChild(sunsetConvertedTitle);
sunsetConvertedText.appendChild(sunsetConvertedTime);
sunsetConvertedDiv.appendChild(sunsetConvertedIcon);
sunsetConvertedDiv.appendChild(sunsetConvertedText);
convertedTimesDiv.appendChild(sunriseConvertedDiv);
convertedTimesDiv.appendChild(sunsetConvertedDiv);
sunriseSunsetHero.appendChild(convertedTimesDiv);
moreInfoHero.appendChild(sunriseSunsetHero);
weatherContainer.appendChild(moreInfoHero);
document.body.appendChild(weatherContainer);

const footer = document.createElement('footer');
footer.textContent = '© ';
const link = document.createElement('a');
link.setAttribute('href', 'https://github.com/adiferrer');
link.textContent = 'Jeanne Ferrer';
footer.appendChild(link);
const top = document.createTextNode(', The Odin Project 2023');
footer.appendChild(top);
document.body.appendChild(footer);

const imageContainer = document.createElement('div');
imageContainer.setAttribute('id', 'image-container');
const image = document.createElement('img');
image.setAttribute('id', 'image');

document.body.setAttribute('data-theme', 'light');

window.onload = () => {
  if (localStorage.getItem('currentPlace') === null) {
    localStorage.setItem('currentPlace', 'Calgary');
  }

  form.style.display = 'none';
  const weatherDataStart = processWeatherData(localStorage.getItem('currentPlace'));
  weatherDataStart.then((data) => {
    setTimeout(() => {
      form.style.opacity = 1;
      form.style.display = 'flex';
    }, 1000);
    insertWeatherInfo(data);
  }).catch((error) => {
    setTimeout(() => {
      form.style.opacity = 1;
      form.style.display = 'flex';
    }, 1000);
  });
};
