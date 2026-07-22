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
const cityListEl = document.getElementById("city-list");

const CITY_ALIASES = {
  "서울": "Seoul",
  "부산": "Busan",
  "인천": "Incheon",
  "대구": "Daegu",
  "대전": "Daejeon",
  "광주": "Gwangju",
  "울산": "Ulsan",
  "수원": "Suwon",
  "성남": "Seongnam",
  "고양": "Goyang",
  "용인": "Yongin",
  "청주": "Cheongju",
  "전주": "Jeonju",
  "천안": "Cheonan",
  "제주": "Jeju",
  "춘천": "Chuncheon",
  "여수": "Yeosu",
  "포항": "Pohang",
  "도쿄": "Tokyo",
  "오사카": "Osaka",
  "교토": "Kyoto",
  "삿포로": "Sapporo",
  "베이징": "Beijing",
  "상하이": "Shanghai",
  "홍콩": "Hong Kong",
  "타이베이": "Taipei",
  "방콕": "Bangkok",
  "싱가포르": "Singapore",
  "뉴욕": "New York",
  "로스앤젤레스": "Los Angeles",
  "라스베이거스": "Las Vegas",
  "런던": "London",
  "파리": "Paris",
  "로마": "Rome",
  "베를린": "Berlin",
  "시드니": "Sydney",
  "토론토": "Toronto",
  "밴쿠버": "Vancouver",
};

cityListEl.innerHTML = Object.keys(CITY_ALIASES)
  .map((name) => `<option value="${name}"></option>`)
  .join("");

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
    let coords = location;
    let displayName = null;

    if (location.q) {
      const place = await geocodeCity(location.q);
      coords = { lat: place.lat, lon: place.lon };
      displayName = place.displayName;
    }

    const current = await fetchCurrent(coords);
    showResult(current, displayName);
    cityInput.value = displayName || current.name;

    if (window.setWeatherScene) {
      const isNight = current.weather[0].icon.endsWith("n");
      window.setWeatherScene(current.weather[0].main, isNight);
    }

    const { list, timezoneOffset } = await fetchForecast(coords);
    showHourly(list.slice(0, 8), timezoneOffset);
    showForecast(groupForecastByDay(list, timezoneOffset).slice(0, 5));
  } catch (err) {
    showError(err.message);
  }
}

async function geocodeCity(query) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=10&appid=${window.OPENWEATHER_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("도시를 찾을 수 없습니다.");
  }

  const results = await response.json();
  if (!results.length) {
    throw new Error("도시를 찾을 수 없습니다.");
  }

  // 한글 이름이 검색어로 시작하는 결과를 우선시 (API 정렬이 부정확할 때 보정)
  const startsWithQuery = results.filter(
    (r) => r.local_names && r.local_names.ko && r.local_names.ko.startsWith(query)
  );
  const candidates = startsWithQuery.length ? startsWithQuery : results;
  const match = candidates.find((r) => r.country === "KR") || candidates[0];

  return {
    lat: match.lat,
    lon: match.lon,
    displayName: (match.local_names && match.local_names.ko) || match.name,
  };
}

function buildQuery(location) {
  return `lat=${location.lat}&lon=${location.lon}`;
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
  return { list: data.list, timezoneOffset: data.city.timezone };
}

function localDate(entry, timezoneOffset) {
  return new Date((entry.dt + timezoneOffset) * 1000);
}

function showResult(data, displayName) {
  cityNameEl.textContent = displayName || data.name;
  descriptionEl.textContent = data.weather[0].description;
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
  humidityEl.textContent = `습도 ${data.main.humidity}%`;
  iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  iconEl.alt = data.weather[0].description;
  result.classList.remove("hidden");
}

function groupForecastByDay(list, timezoneOffset) {
  const days = {};

  list.forEach((entry) => {
    const local = localDate(entry, timezoneOffset);
    const date = `${local.getUTCFullYear()}-${local.getUTCMonth()}-${local.getUTCDate()}`;
    const hour = local.getUTCHours();

    if (!days[date]) {
      days[date] = {
        label: `${local.getUTCMonth() + 1}/${local.getUTCDate()}`,
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        icon: entry.weather[0].icon,
        description: entry.weather[0].description,
      };
    }

    const d = days[date];
    d.min = Math.min(d.min, entry.main.temp_min);
    d.max = Math.max(d.max, entry.main.temp_max);
    if (hour === 12) {
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

function showHourly(hours, timezoneOffset) {
  if (!hours.length) {
    hourlyEl.classList.add("hidden");
    return;
  }

  hourlyEl.innerHTML = hours
    .map((hour) => {
      const local = localDate(hour, timezoneOffset);
      const label = `${local.getUTCHours()}시`;
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
