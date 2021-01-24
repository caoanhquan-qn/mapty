"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

const formRow = document.querySelectorAll(".form__row");

let workoutArray = [];

class Workout {
  date = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date());

  id = new Date().getTime();

  constructor(distance, duration, coords) {
    this.distance = distance; // in km
    this.duration = duration; // in minute
    this.coords = coords;
  }
}
class Running extends Workout {
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance; // in min/km
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(1);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this)); // this = DOM element, fix it by using bind method
    inputType.addEventListener("input", this._toggleElevationField.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _toggleElevationField(event) {
    event.preventDefault();
    if (inputType.value === "cycling") {
      formRow[3].classList.add("form__row--hidden");
      formRow[4].classList.remove("form__row--hidden");
    }
    if (inputType.value === "running") {
      formRow[3].classList.remove("form__row--hidden");
      formRow[4].classList.add("form__row--hidden");
    }
  }
  _newWorkout(event) {
    event.preventDefault();

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // + convert string to number
    const duration = +inputDuration.value;

    // validate
    function validateInput(num1, num2, num3) {
      if (
        typeof num1 !== "number" ||
        typeof num2 !== "number" ||
        typeof num3 !== "number"
      ) {
        return alert("Inputs have to be positive numbers");
      }
    }
    // type : running

    if (type === "running") {
      const cadence = +inputCadence.value;
      if (distance < 0 || duration < 0 || cadence < 0) {
        return alert("input must be always a positive number");
      }
      validateInput(distance, duration, cadence);
    }

    // type : cycling

    if (type === "cycling") {
      const elevationGain = +inputElevation.value;
      if (distance < 0 || duration < 0 || elevationGain < 0) {
        return alert("input must be always a positive number");
      }
      validateInput(distance, duration, elevationGain);
    }

    const activity = type === "running" ? "🏃‍♂️ Running" : "🚴‍♀️ Cycling";
    const classActivity =
      type === "running" ? "workout--running" : "workout--cycling";

    // display marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${classActivity}`,
        })
      )
      .setPopupContent(
        `${activity} on ${new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
        }).format(new Date())}`
      )
      .openPopup();

    const workout = new Workout(inputDistance.value, inputDuration.value, [
      lat,
      lng,
    ]);

    console.log(workout);
    if (type === "running") {
      let run = new Running(
        workout.distance,
        workout.duration,
        workout.coords,
        inputCadence.value
      );
      workoutArray.push(run);
      const workoutSummary = `<li class="workout workout--running" data-id= ${
        run.id
      }>
      <h2 class="workout__title">${activity} on ${new Intl.DateTimeFormat(
        "en-US",
        {
          month: "long",
          day: "numeric",
        }
      ).format(new Date())}</h2>
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${run.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${run.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${run.pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${run.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

      form.insertAdjacentHTML("afterend", workoutSummary);
    }
    if (type === "cycling") {
      let cyc = new Cycling(
        workout.distance,
        workout.duration,
        workout.coords,
        inputElevation.value
      );
      workoutArray.push(cyc);
      const workoutSummary = `<li class="workout workout--cycling" data-id= ${
        cyc.id
      }>
      <h2 class="workout__title">${activity} on ${new Intl.DateTimeFormat(
        "en-US",
        {
          month: "long",
          day: "numeric",
        }
      ).format(new Date())}</h2>
      <div class="workout__details">
        <span class="workout__icon">🚴‍♀️</span>
        <span class="workout__value">${cyc.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${cyc.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${cyc.speed}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${cyc.elevationGain}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

      form.insertAdjacentHTML("afterend", workoutSummary);
    }

    // hide form and clear input fields
    form.classList.add("hidden");
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      "";
  }
}
const app = new App();
