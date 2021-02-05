const db = require('./index');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db.query(`
  SELECT * FROM users
  WHERE email=$1
  `, [email])
    .then(res => res.rows.length ? res.rows[0] : null)
    .catch(err => console.log(err));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return db.query(`
  SELECT * FROM users
  WHERE id=$1
  `, [id])
    .then(res => res.rows.length ? res.rows[0] : null)
    .catch(err => console.log(err));
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const newUser = [
    user.name,
    user.email,
    user.password
  ];

  return db.query(`
  INSERT INTO users (name, email, password)
  VALUES ( $1, $2, $3 )
  RETURNING *;
  `, newUser)
    .then(res => res.rows.length ? res.rows[0] : null)
    .catch(err => console.log(err));
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 20) {
  return db.query(`
  SELECT *
  FROM reservations
  JOIN properties
    ON properties.id = reservations.property_id
  WHERE guest_id=$1
  LIMIT $2;
  `, [guest_id, limit])
    .then(res => res.rows);
};
exports.getAllReservations = getAllReservations;

/// New Reservations

/**
 * Check if the reservation date is available.
 * If so, INSERT reservation data INTO reservations DB
 * @param {{guest_id: integer, start_date: date, end_date: date}} values Reservation details
 * @return {Promise<[{}]>} A promise to the make reservations.
 */
const addReservation = function(values) {
  const queryParams = [ values.guest_id, values.start_date, values.end_date, values.property_id.slice(8) ];
  const queryString = `
    INSERT INTO reservations (
      guest_id,
      start_date,
      end_date,
      property_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  return db.query(queryString, queryParams).then(res => res.rows);
};
exports.addReservation = addReservation;
/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];

  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating) AS average_rating
  FROM properties
  LEFT JOIN property_reviews
    ON properties.id = property_id
  `;

  let flag = 0;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `
    WHERE city LIKE $${queryParams.length}
    `;
    flag = 1;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += flag ? `AND owner_id =$${queryParams.length}\n` : `WHERE owner_id =$${queryParams.length}\n`;
    flag = 1;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += flag ? `AND cost_per_night >=$${queryParams.length}\n` : `WHERE cost_per_night >=$${queryParams.length}\n`;
    flag = 1;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += flag ? `And cost_per_night <=$${queryParams.length}\n` : `WHERE cost_per_night <=$${queryParams.length}\n`;
    flag = 1;
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
    GROUP BY properties.id
    Having AVG(property_reviews.rating) >=$${queryParams.length}
    `;
  } else {
    queryString += `
    GROUP BY properties.id
    `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return db.query(queryString, queryParams)
  .then(res => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryHead = `INSERT INTO properties `;
  const queryTail = `RETURNING *;`;
  const queryParams = [];
  let queryCol = '(';
  
  Object.entries(property).forEach(col => {
    queryCol += col[0] + ', ';
    queryParams.push(col[1]);
  });

  queryCol = queryCol.slice(0, queryCol.length - 2) + ')';
  const queryVal = 'VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 )\n';
  const queryString = queryHead + queryCol + queryVal + queryTail;

  return db.query(queryString, queryParams).then(res => res.rows);
};
exports.addProperty = addProperty;
