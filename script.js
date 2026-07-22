const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const locateBtn = document.getElementById("locate-btn");
const result = document.getElementById("result");
const errorEl = document.getElementById("error");
const cityNameEl = document.getElementById("city-name");
const descriptionEl = document.getElementById("description");
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const iconEl = document.getElementById("weather-icon");
const forecastEl = document.getElementById("forecast");
const hourlyEl = document.getElementById("hourly");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  await loadWeather({ q: city });
});

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("이 브라우저는 위치 정보를 지원하지 않습니다.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    },
    () => {
      showError("위치 권한이 거부되었습니다.");
    }
  );
});

async function loadWeather(location) {
  result.classList.add("hidden");
  forecastEl.classList.add("hidden");
  hourlyEl.classList.add("hidden");
  errorEl.classList.add("hidden");

  try {
    const current = await fetchCurrent(location);
    showResult(current);
    cityInput.value = current.name;

    if (window.setWeatherScene) {
      const isNight = current.weather[0].icon.endsWith("n");
      window.setWeatherScene(current.weather[0].main, isNight);
    }

    const list = await fetchForecast({ lat: current.coord.lat, lon: current.coord.lon });
    showHourly(list.slice(0, 8));
    showForecast(groupForecastByDay(list).slice(0, 5));
  } catch (err) {
    showError(err.message);
  }
}

function buildQuery(location) {
  return location.q
    ? `q=${encodeURIComponent(location.q)}`
    : `lat=${location.lat}&lon=${location.lon}`;
}

async function fetchCurrent(location) {
  if (!window.OPENWEATHER_API_KEY) {
    throw new Error("API 키가 설정되지 않았습니다. config.js를 확인하세요.");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?${buildQuery(
    location
  )}&appid=${window.OPENWEATHER_API_KEY}&units=metric&lang=kr`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("도시를 찾을 수 없습니다.");
    }
    throw new Error("날씨 정보를 가져오지 못했습니다.");
  }

  return response.json();
}

async function fetchForecast(location) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?${buildQuery(
    location
  )}&appid=${window.OPENWEATHER_API_KEY}&units=metric&lang=kr`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("예보 정보를 가져오지 못했습니다.");
  }

  const data = await response.json();
  return data.list;
}

function showResult(data) {
  cityNameEl.textContent = data.name;
  descriptionEl.textContent = data.weather[0].description;
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
  humidityEl.textContent = `습도 ${data.main.humidity}%`;
  iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  iconEl.alt = data.weather[0].description;
  result.classList.remove("hidden");
}

function groupForecastByDay(list) {
  const days = {};

  list.forEach((entry) => {
    const [date, time] = entry.dt_txt.split(" ");
    if (!days[date]) {
      const [, month, day] = date.split("-");
      days[date] = {
        label: `${Number(month)}/${Number(day)}`,
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        icon: entry.weather[0].icon,
        description: entry.weather[0].description,
      };
    }

    const d = days[date];
    d.min = Math.min(d.min, entry.main.temp_min);
    d.max = Math.max(d.max, entry.main.temp_max);
    if (time === "12:00:00") {
      d.icon = entry.weather[0].icon;
      d.description = entry.weather[0].description;
    }
  });

  return Object.values(days);
}

function showForecast(days) {
  if (!days.length) {
    forecastEl.classList.add("hidden");
    return;
  }

  forecastEl.innerHTML = days
    .map(
      (day) => `
        <div class="forecast-card">
          <p class="forecast-date">${day.label}</p>
          <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" />
          <p class="forecast-temp-max">${Math.round(day.max)}°</p>
          <p class="forecast-temp-min">${Math.round(day.min)}°</p>
        </div>
      `
    )
    .join("");

  forecastEl.classList.remove("hidden");
}

function showHourly(hours) {
  if (!hours.length) {
    hourlyEl.classList.add("hidden");
    return;
  }

  hourlyEl.innerHTML = hours
    .map((hour) => {
      const date = new Date(hour.dt_txt);
      const label = `${date.getHours()}시`;
      return `
        <div class="hourly-card">
          <p class="hourly-time">${label}</p>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}" />
          <p class="hourly-temp">${Math.round(hour.main.temp)}°</p>
        </div>
      `;
    })
    .join("");

  hourlyEl.classList.remove("hidden");
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}
