SELECT COUNT(*) as total_tasks FROM tasks;
SELECT COUNT(*) as march_tasks FROM tasks WHERE due_date >= '2026-03-01' AND due_date < '2026-04-01';
SELECT title, due_date, tags FROM tasks WHERE due_date >= '2026-03-01' LIMIT 10;