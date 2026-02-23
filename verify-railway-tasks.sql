SELECT COUNT(*) as total_tasks FROM tasks WHERE user_id = '3d0945f1-3458-44da-a555-d3e4f7d17a11';
SELECT COUNT(*) as march_tasks FROM tasks WHERE due_date >= '2026-03-01' AND due_date < '2026-04-01';
SELECT title, due_date FROM tasks WHERE due_date >= '2026-03-01' LIMIT 5;