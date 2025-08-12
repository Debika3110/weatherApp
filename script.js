// Query Selectors for Tabs and Containers
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let currentTab = userTab;  // Initialize current tab
const API_KEY = "d1b7d519bdce5b336ea307d8d287207a";  // Your API key
currentTab.classList.add("current-tab");  // Add class to current tab

// Function to switch tabs
function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");  // Remove from previous tab
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");  // Add to new tab

        if (!searchForm.classList.contains("active")) {
            // Switching from "Your Weather" to "Search Weather"
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");  // Show search form
        } else {
            // Switching from "Search Weather" to "Your Weather"
            searchForm.classList.remove("active");  // Hide search form
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();  // Get local weather
        }
    }
}

// Event Listeners for Tab Switching
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Function to Get Coordinates from Session Storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");  // Show grant access container
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);  // Fetch weather
    }
}

// Function to Fetch User Weather Info Based on Coordinates
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active");  // Hide grant access container
    loadingScreen.classList.add("active");  // Show loading screen

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");  // Hide loading screen
        userInfoContainer.classList.add("active");  // Show user info
        renderWeatherInfo(data);  // Display weather info
    } catch (err) {
        loadingScreen.classList.remove("active");
        console.error("Error fetching weather data", err);
    }
}

// Function to Render Weather Info in the UI
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name || "Unknown";
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description || "N/A";
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

// Function to Get User Location via Geolocation API
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to Show User Position and Save Coordinates
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Event Listener for Grant Access Button
const grantaccessButton = document.querySelector("[data-grantAccess]");
grantaccessButton.addEventListener("click", getLocation);

// Event Listener for Search Form Submission
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();  // Prevent form from submitting
    let cityName = searchInput.value.trim();  // Trim city name input
    if (cityName !== "") {
        fetchSearchWeatherInfo(cityName);  // Fetch weather for city
    }
});

// Function to Fetch Weather Info for Searched City
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (data.cod === "404") {
            alert("City not found.");
            loadingScreen.classList.remove("active");
            return;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        console.error("Error fetching city weather", err);
    }
}
