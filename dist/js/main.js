import { setLocationObject, 
    getHomeLocation, 
    cleanText, 
    getCoordsFromApi, 
    getWeatherFromCoords } from "./dataFunctions.js";
import { 
    setPlaceholderText,
    addSpinner, 
    displayError,
    displayApiError,
    updateScreenReaderConfirmation,
    updateDisplay,
 } from "./domFunctions.js";

import CurrentLocation from "./CurrentLocation.js";

const currentLoc = new CurrentLocation();


const initApp = () => {

    //define listeners
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);
    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather);
    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);
    const unit = document.getElementById("unit");
    unit.addEventListener("click", setUnitPref);
    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);
    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);

    //setup
    setPlaceholderText();

    //load default App
    loadWeather();
}


document.addEventListener("DOMContentLoaded", initApp)

const getGeoWeather = (event) => {
        if (event) {
            if (event.type === "click") {
                const mapIcon = document.querySelector(".fa-map-marker-alt");
                addSpinner(mapIcon);

            }
        }

        if (!navigator.geolocation) return geoError();
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError)
};


const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not Supported";
    displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
    const myCoordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name :`Lat: ${position.coords.latitude} Long: ${position.coords.longitude}`
    };

    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
};


const loadWeather = (event) => {
    const savedLocation = getHomeLocation();
    if (!savedLocation && !event) return getGeoWeather()
    if (!savedLocation && event.type ==="click") {
        displayError(
            "No Loaction Saved.",
            "Sorry...Please save your home location first"
        )
    } else if (savedLocation && !event) {
        displayHomeLocationWeather(savedLocation)
    } else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
}


const displayHomeLocationWeather = (home) => {
    if(typeof home === "string") {
        const locationJson = JSON.parse(home);
        const myCoordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit
        };
        setLocationObject(currentLoc, myCoordsObj);
        updateDataAndDisplay(currentLoc);
    }
}

const savedLocation = () => {
    if(currentLoc.getLat() && currentLoc.getLon()) {
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            name: currentLoc.getName(),
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            unit: currentLoc.getUnit() 
        };

        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreenReaderConfirmation(`Saved ${currentLoc.getName()} as home location.`);
    }
}


const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleunit();
    updateDataAndDisplay(currentLoc);
}

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fa-syn-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
}



const submitNewLocation = async (event) => {
        event.preventDefault();
        const text = document.getElementById("searchBar__text").value;
        const entryText = cleanText(text);
        if (!entryText.length) return;
        const locationIcon = document.querySelector(".fa-search");
        addSpinner(locationIcon);
        const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
        if (coordsData) {
        if (coordsData.cod === 200) {
            const myCoordsObj = {
                lat: coordsData.coords.lat,
                lon: coordsData.coords.lon,
                name: coordsData.sys.country 
                ? `${coordsData.name}, ${coordsData.sys.country}`
                : coordsData.name 
                 
            };
            setLocationObject(currentLoc, myCoordsObj);
            updateDataAndDisplay(currenLoc);
        } else {
            displayApiError(coordsData);
        }
    } else {
        displayError("Connection Error", "Connection Error");
    }
};



const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj)
    console.log(weatherJson);
    if (weatherJson) updateData(weatherJson, locationObj)
}





















