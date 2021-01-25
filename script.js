"use strict";

// => tell prettier extension to ignore the next line
// prettier-ignore
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

const formRow = document.querySelectorAll(".form__row");

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
    this.pace = (this.duration / this.distance).toFixed(1); // in min/km
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
  workoutArray = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this)); // this = DOM element, fix it by using bind method
    inputType.addEventListener("input", this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener("click", this._moveMap.bind(this));
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
    const cadence = +inputCadence.value;
    const elevationGain = +inputElevation.value;

    let workout;

    // check input

    function isAllFinite(...nums) {
      const allFinite = nums.every((num) => Number.isFinite(num));
      return allFinite;
    }
    function isAllPositive(...nums) {
      const allPositive = nums.every((num) => num > 0);
      return allPositive;
    }
    // type : running

    if (type === "running") {
      if (
        !isAllFinite(distance, duration, cadence) ||
        !isAllPositive(distance, duration, cadence)
      ) {
        return alert("Inputs must be always positive numbers");
      }
    }

    // type : cycling

    if (type === "cycling") {
      if (
        !isAllFinite(distance, duration, elevationGain) ||
        !isAllPositive(distance, duration)
      ) {
        return alert("Inputs must be always positive numbers");
      }
    }

    if (
      type === "running" &&
      isAllFinite(distance, duration, cadence) &&
      isAllPositive(distance, duration, cadence)
    ) {
      // display marker

      const activity = type === "running" ? "🏃‍♂️ Running" : "🚴‍♀️ Cycling";
      const classActivity =
        type === "running" ? "workout--running" : "workout--cycling";

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

      workout = new Running(distance, duration, [lat, lng], cadence);

      const workoutSummary = `<li class="workout workout--running" data-id= ${
        workout.id
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
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

      // spm = steps per minute

      form.insertAdjacentHTML("afterend", workoutSummary);
    }

    if (
      type === "cycling" &&
      isAllFinite(distance, duration, elevationGain) &&
      isAllPositive(distance, duration)
    ) {
      // display marker

      const activity = type === "running" ? "🏃‍♂️ Running" : "🚴‍♀️ Cycling";
      const classActivity =
        type === "running" ? "workout--running" : "workout--cycling";

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

      workout = new Cycling(distance, duration, [lat, lng], elevationGain);

      const workoutSummary = `<li class="workout workout--cycling" data-id= ${
        workout.id
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
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;

      form.insertAdjacentHTML("afterend", workoutSummary);
    }

    this.workoutArray.push(workout);

    // hide form and clear input fields

    form.classList.add("hidden");
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      "";
  }

  // move to marker on click
  _moveMap(event) {
    const item = event.target.closest("li");
    if (item) {
      const itemId = Number(item.dataset.id);
      this.workoutArray.forEach((workout) => {
        if (workout.id === itemId) {
          const [lat, lng] = workout.coords;
          this.#map.flyTo([lat, lng]);
        }
      });
    } else {
      return;
    }
  }
}
const app = new App();
