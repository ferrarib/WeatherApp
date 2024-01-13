import Chart from 'chart.js/auto';
import weatherConditions from './weatherConditions.json';

const baseURL = 'http://api.weatherapi.com/v1';
const API_KEY = '6dc4a02db5314276be852310233112';
const weekday = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday", "Sunday"];
let isCelsius = true;

async function GetData(location) {
  const response = await fetch(`${baseURL}/forecast.json?key=${API_KEY}&days=3&q=${location}`);
  return response.json();
}

function ToggleTemp() {
  isCelsius = !isCelsius;
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function CreateHourlyChart(data) {
  const hourlyChart = document.getElementById('hourly-forecast');
  let hourlyData = [];

  data.hour.forEach((hour, i) => {
    if (i % 3 == 0){
      let time = formatAMPM(new Date(hour.time));
      hourlyData.push({ hour: time, temp: Math.round(isCelsius ? hour.temp_c : hour.temp_f)});
    }
  });

  new Chart(
    hourlyChart, {
      type: "line",
      data: {
        labels: hourlyData.map(row => row.hour),
        datasets: [
          {
            label: 'Temperature per Hour',
            data: hourlyData.map(row => row.temp)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'white',
              font: {
                size: 18
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: 'white'
            }
          },
          x: {
            ticks: {
              color: 'white'
            }
          }
        }
      }
    }
  );
}

function CreateWindChart(data) {
  const hourlyChart = document.getElementById('wind');
  let hourlyData = [];

  data.hour.forEach((hour, i) => {
    if (i % 3 == 0){
      let time = formatAMPM(new Date(hour.time));
      hourlyData.push({ hour: time, speed: Math.round(hour.wind_kph)});
    }
  });

  new Chart(
    hourlyChart, {
      type: "line",
      data: {
        labels: hourlyData.map(row => row.hour),
        datasets: [
          {
            label: 'Wind Speed - Km/h',
            data: hourlyData.map(row => row.speed)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'white',
              font: {
                size: 18
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: 'white'
            }
          },
          x: {
            ticks: {
              color: 'white'
            }
          }
        }
      }
    }
  );
}

function RenderData(data) {
  console.log(data);
  const content = document.getElementById('content');
  content.innerHTML = '';

  // City Info
  const cityInfo = document.createElement('div');
  cityInfo.classList.add('city-info');

  const cityName = document.createElement('div');
  cityName.classList.add('city-name');
  cityName.textContent = `${data.location.name}, ${data.location.country}`;

  const cityTemp = document.createElement('div');
  cityTemp.classList.add('city-temp');
  cityTemp.textContent = Math.round(isCelsius ? data.current.temp_c : data.current.temp_f);

  const cityCondition = document.createElement('div');
  cityCondition.classList.add('city-condition');
  cityCondition.textContent = data.current.condition.text;

  cityInfo.appendChild(cityName);
  cityInfo.appendChild(cityTemp);
  cityInfo.appendChild(cityCondition);

  const detailsContainer = document.createElement('div');
  detailsContainer.classList.add('details-container');

  const hourlyWrapper = document.createElement('div');
  hourlyWrapper.classList.add('canvas-wrapper');

  // hourly chart
  const hourlyForecast = document.createElement('canvas');
  hourlyForecast.id = 'hourly-forecast';

  hourlyWrapper.appendChild(hourlyForecast);

  const windWrapper = document.createElement('div');
  windWrapper.classList.add('canvas-wrapper');

  // Daily Forecast
  const wind = document.createElement('canvas');
  wind.id = 'wind';

  windWrapper.appendChild(wind);

  // Daily Forecast
  const threeDayForecast = document.createElement('div');
  threeDayForecast.classList.add('three-day-forecast');

  data.forecast.forecastday.forEach((currentDay) => {
    const day = document.createElement('div');

    const dayTitle = document.createElement('div');
    dayTitle.classList.add('forecast-title');
    dayTitle.textContent = weekday[(new Date(currentDay.date)).getDay()];

    const dayTemp = document.createElement('div');
    dayTemp.classList.add('forecast-temp');
    dayTemp.textContent = Math.round(isCelsius ? currentDay.day.maxtemp_c : currentDay.day.maxtemp_f);
    
    const dayCondition = document.createElement('div');
    dayCondition.classList.add('forecast-condition');
    dayCondition.textContent = currentDay.day.condition.text;

    day.appendChild(dayTitle);
    day.appendChild(dayTemp);
    day.appendChild(dayCondition);

    threeDayForecast.appendChild(day);
  })

  detailsContainer.appendChild(hourlyWrapper);

  detailsContainer.appendChild(windWrapper);
  detailsContainer.appendChild(threeDayForecast);

  content.appendChild(cityInfo);
  content.appendChild(detailsContainer);

  CreateHourlyChart(data.forecast.forecastday[0]);
  CreateWindChart(data.forecast.forecastday[0]);
}

const search = document.getElementById('search');
const switchContainer = document.querySelector('.checkbox-container');
console.log(switchContainer);

search.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.value !== ''){
    GetData(event.target.value)
      .then((data) => {
        RenderData(data);
      });
  }
});

switchContainer.addEventListener('click', () => {
  const dot = switchContainer.querySelector('.checkbox-dot');
  const checkbox = switchContainer.querySelector('.checkbox');

  dot.classList.toggle('switched-dot');
  checkbox.classList.toggle('switched-bg');

  ToggleTemp();
  const search = document.getElementById('search');
  search.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
});



