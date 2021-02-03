SELECT
  rsv.id AS reservation_id,
  rsv.start_date AS start_date,
  pt.*,
  AVG(rv.rating) AS average_rating
FROM reservations rsv
JOIN properties pt
  ON pt.id = rsv.property_id
JOIN property_reviews rv
  ON rv.property_id = pt.id
WHERE rsv.end_date < NOW()::DATE
  AND rsv.guest_id = 1
GROUP BY rsv.id, pt.id
ORDER BY rsv.start_date
LIMIT 10;