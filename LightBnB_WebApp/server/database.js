const properties = require('./json/properties.json');
const users = require('./json/users.json');

// DB connection configuration

const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {

  const userQuery = `
  SELECT *
  FROM users
  WHERE users.email = $1
  ;
  `;

  return pool.query(userQuery, [email])
    .then((res) => {
      const user = res.rows[0];
      // console.log({user});
      return user;
    })
    .catch(err => err.message);
};


exports.getUserWithEmail = getUserWithEmail;



/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {

  const userQuery = `
  SELECT *
  FROM users
  WHERE users.id = $1
  ;
  `;

  return pool.query(userQuery, [id])
    .then((res) => {
      const user = res.rows[0];
      // console.log({user});
      return user;
    })
    .catch(err => err.message);
};

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser =  function(user) {
  const email = user.email;
  const name = user.name;
  const password = user.password;

  const addUserQuery = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `;

  return pool.query(addUserQuery, [name, email, password])
    .then((res) => {
      const user = res.rows[0];
      // console.log({user});
      return user;
    })
    .catch((err) => err.message);
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guestId, limit = 10) {

  const reservationsQuery = `
  SELECT properties.*, reservations.*
  FROM reservations
  JOIN properties
    ON properties.id = reservations.property_id
  WHERE reservations.guest_id = $1
  LIMIT $2 ;
  `;
  return pool.query(reservationsQuery, [guestId, limit])
    .then((res) => {
      const reservations = res.rows;
      // console.log({reservations});
      return reservations;
    })
    .catch((err) => err.message);
};
exports.getAllReservations = getAllReservations;

/// Properties
const addLimitClauseAndClose = function(limit, queryString, queryParams) {
  queryParams.push(limit);
  queryString += ` LIMIT $${queryParams.length} ; `;
  return queryString;
};

const getFilterPrefix = function(position) {
  return (position === 1) ? ` WHERE `
    : (position > 1) ? ` AND ` : ` `;
};

const preparePropsQueryAndParams = function(options, limit, queryParams) {

  let queryString = `
SELECT *
FROM properties
`;
  // If no options are provided then just return properties upto LIMIT
  if (!options) {
    return addLimitClauseAndClose(limit, queryString, queryParams);
  }

  // if owner_id is provided then just query properties of that owner
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += ` WHERE owner_id = $${queryParams.length} `;
    return addLimitClauseAndClose(limit, queryString, queryParams);
  }

  // Add options to query
  queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating FROM properties JOIN property_reviews ON properties.id = property_reviews.property_id `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += getFilterPrefix(queryParams.length);
    queryString += ` properties.city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += getFilterPrefix(queryParams.length);
    queryString += ` properties.cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += getFilterPrefix(queryParams.length);
    queryString += ` properties.cost_per_night <= $${queryParams.length} `;
  }

  queryString += ` GROUP BY properties.id `

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryString += ` ORDER BY cost_per_night `;
  return addLimitClauseAndClose(limit, queryString, queryParams);
};

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {

  const queryParams = [];
  const propsQuery = preparePropsQueryAndParams(options, limit, queryParams);

  console.log({propsQuery});
  console.log({queryParams});

  return pool
    .query(propsQuery, queryParams)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => err.message);
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
