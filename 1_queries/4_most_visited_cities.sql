SELECT pt.city AS city, COUNT(rsv.*) AS total_reservations
FROM properties pt
JOIN reservations rsv
  ON rsv.property_id = pt.id
GROUP BY pt.city
ORDER BY total_reservations DESC;