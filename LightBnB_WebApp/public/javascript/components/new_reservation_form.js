$(() => {

  const $makeReservationForm = $(`
    <form method="POST" action="/reservations">
      <label for="start_date">Start date:</label>
      <input id="start_date" name="start_date" type="date"></input>
      <label for="end_date">End date:</label>
      <input id="end_date" name="end_date" type="date"></input>
      <label for="num_of_guests">Number of Guests:</label>
      <input name="num_of_guests" type="number"></input>
      <label for="check_in">Preferred check-in time:</label>
      <input name="check_in" type="time"></input>
      <input type="hidden" id="property_id" name="property_id" value="${localStorage.getItem('property_id')}">
      <button type="submit">Submit</button>

      <div class="new-reservation-form__field-wrapper">
          <a id="new-reservation-form__cancel" href="#">Cancel</a>
      </div>
    </form>
  `);

  window.$makeReservationForm = $makeReservationForm;

  $makeReservationForm.on('submit', function(event) {
    event.preventDefault();
    const data = $(this).serialize();

    makeReservation(data).then(() => {
      propertyListings.clearListings();
      getAllReservations()
        .then(function(json) {
          propertyListings.addProperties(json.reservations, true);
          views_manager.show('listings');
        })
        .catch(error => console.error(error));
    });
  });

  $('body').on('click', '#new-reservation-form__cancel', function() {
    views_manager.show('listings');
    return false;
  });

});