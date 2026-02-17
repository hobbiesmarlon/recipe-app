SELECT r.name as recipe_name, c.name as category_name
FROM recipes r
JOIN recipe_categories rc ON r.id = rc.recipe_id
JOIN categories c ON rc.category_id = c.id
ORDER BY r.name;
