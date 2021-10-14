SELECT reservations.*, properties.*,
  AVG(property_reviews.rating) as average_rating
FROM properties
JOIN reservations
  ON properties.id = reservations.property_id
JOIN property_reviews
  ON reservations.id = property_reviews.reservation_id
WHERE reservations.guest_id = 1
  AND end_date <= now()::date
GROUP BY reservations.id, properties.id
ORDER BY start_date ASC
LIMIT 10
;

