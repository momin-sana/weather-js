const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i");
unitSelection = document.querySelectorAll('input[name="unit"]');
document.getElementById("year").textContent = new Date().getFullYear();

let api;
let currentUnit = "imperial"; // Default unit is Fahrenheit
let currentTemp, currentFeelsLike; // Variables to store current temperature and feels like temperature
let body = document.getElementById('weatherBody');

inputField.addEventListener("keyup", e =>{
    if(e.key == "Enter" && inputField.value != ""){
        requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){ 
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }else{
        alert("Your browser not support geolocation api");
    }
});

unitSelection.forEach(unit => {
    unit.addEventListener("change", () => {
        const selectedUnit = document.querySelector('input[name="unit"]:checked').value;
        if (selectedUnit !== currentUnit) {
            currentUnit = selectedUnit;
            convertTemperature();
        }
    });
});

function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=fe757dc5c02c2de97cccd503fffadc39`;
    fetchData();
}

function onSuccess(position){
    const {latitude, longitude} = position.coords; 
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=fe757dc5c02c2de97cccd503fffadc39`;
    fetchData();
}

function onError(error){
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

function fetchData(){
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    fetch(api).then(res => res.json()).then(result => {
      console.log(result); 
      weatherDetails(result);
  }).catch(() =>{
      infoTxt.innerText = "Something went wrong";
      infoTxt.classList.replace("pending", "error");
  });
}

function weatherDetails(info){
    if(info.cod == "404"){
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    }else{
        const city = info.name;
        const country = info.sys.country;
        const {description, id} = info.weather[0];
        const {temp, feels_like,humidity} = info.main;
        const timezoneOffset = info.timezone;
              
        const utcTime = new Date().getTime();
        const localTime = new Date(utcTime + timezoneOffset * 1000);

        const option = {
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
          //Time is not being displayed accurate
          // hour: '2-digit', 
          // minute: '2-digit', 
          // second: '2-digit', 
          // hour12: true // Use 12-hour clock with AM/PM
        };

        const formattedTime = localTime.toLocaleDateString("en-US", option);
        console.log(formattedTime);
        // Update the .time element
        const timeElement = weatherPart.querySelector(".time");
        if (timeElement) {
          timeElement.innerText = formattedTime;
        } else {
          console.error(".time element not found or not correctly selected.");
        }
        
        if (id == 800) {
            wIcon.src = "./sun.gif"; // Sunny
        } else if (id >= 200 && id <= 232) {
            wIcon.src = "./wind-power.gif"; // Thunderstorm
        } else if (id >= 600 && id <= 622) {
            wIcon.src = "./snow.gif"; // Snow
        } else if (id >= 701 && id <= 781) {
            wIcon.src = "./foggy.gif"; // Fog, Mist, etc.
        } else if (id >= 801 && id <= 804) {
            if (id == 801) {
                wIcon.src = "./clouds.gif"; // Partially Sunny
            } else if (id == 802) {
                wIcon.src = "./partial-cloudy.gif"; // Partly Cloudy
            } else if (id == 803 || id == 804) {
                wIcon.src = "./clouds.gif"; // Cloudy / Overcast
            }
        } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
            wIcon.src = "./rain.gif"; // Rain
        } else if (id == 802) {
            wIcon.src = "./partial-cloudy.gif"; // Sunshine (assuming it means sunny intervals)
        } else if (id >= 905 && id <= 905) {
            wIcon.src = "./wind.gif"; // Windy
        } else if (id == 906) {
            wIcon.src = "./hailstones.gif"; // Hail
        } else {
            wIcon.src = "./default.png"; // Default icon for undefined weather conditions
        }

        currentTemp = temp;
        currentFeelsLike = feels_like;

        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        weatherPart.querySelectorAll(".time").innerText = formattedTime;
        
        console.log(weatherPart.querySelector(".time").innerText);
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");

          // Ensure the temperature is displayed with the correct unit
          if (currentUnit === "metric") {
            weatherPart.querySelectorAll(".temp .deg").forEach(deg => deg.innerText = "°C");
        } else {
            weatherPart.querySelectorAll(".temp .deg").forEach(deg => deg.innerText = "°F");
        }

    }
}

function convertTemperature() {
    if (currentUnit === "metric") {
        const celsiusTemp = (currentTemp - 32) * 5 / 9;
        const celsiusFeelsLike = (currentFeelsLike - 32) * 5 / 9;
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(celsiusTemp);
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(celsiusFeelsLike);
        weatherPart.querySelector(".temp .deg").innerText = "°C";
    } else {
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(currentTemp);
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(currentFeelsLike);
        weatherPart.querySelector(".temp .deg").innerText = "°F";
    }
}

arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});