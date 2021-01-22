"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

let map, mapEvent;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      const coords = [latitude, longitude];

      map = L.map("map").setView(coords, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (mapE) {
        mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
      });
    },
    function () {
      alert("Could not get your position");
    }
  );
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const activity = inputType.value === "running" ? "🏃‍♂️ Running" : "🚴‍♀️ Cycling";
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "running-popup",
      })
    )
    .setPopupContent(
      `${activity} on ${new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
      }).format(new Date())}`
    )
    .openPopup();

  inputDistance.value = inputDuration.value = inputCadence.value = "";
});

const formRow = document.querySelectorAll(".form__row");

inputType.addEventListener("input", function (event) {
  event.preventDefault();
  if (inputType.value === "cycling") {
    formRow[3].classList.add("form__row--hidden");
    formRow[4].classList.remove("form__row--hidden");
  }
  if (inputType.value === "running") {
    formRow[3].classList.remove("form__row--hidden");
    formRow[4].classList.add("form__row--hidden");
  }
});