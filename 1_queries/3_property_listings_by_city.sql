SELECT pt.id AS id, pt.title AS title, pt.cost_per_night AS cost_per_night, AVG(rv.rating) AS average_rating
FROM properties pt
JOIN property_reviews rv
  ON rv.property_id = pt.id
WHERE pt.city LIKE '%Vancouver%'
GROUP BY pt.id
HAVING AVG(rv.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;