-- Copy all Class records from year 2025 and insert them with year 2026
-- This script duplicates class schedules for the next academic year

INSERT INTO Class (
    name,
    description,
    year,
    term,
    teacher_id,
    min_grade,
    max_grade,
    max_students,
    period,
    fee,
    mendatory,
    enrolled_number,
    min_korean_level,
    max_korean_level,
    display_order
)
SELECT 
    name,
    description,
    2026 as year,  -- Change year to 2026
    'spring' as term,  -- Set term to 'spring' for the new year
    teacher_id,
    min_grade,
    max_grade,
    max_students,
    period,
    fee,
    mendatory,
    0 as enrolled_number,  -- Reset enrollment count to 0 for new year
    min_korean_level,
    max_korean_level,
    display_order
FROM Class 
WHERE year = 2025;

-- Optional: Display the newly created records to verify
SELECT id, name, year, term, period, enrolled_number 
FROM Class 
WHERE year = 2026 
ORDER BY period, name;