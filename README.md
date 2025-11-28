<<<<<<< HEAD
# Faith Immaculate Academy CBT

This repository contains the Faith Immaculate Academy computer-based testing application.

## CSV import for questions
You can bulk-import questions via CSV. A template is included at `/questions-template.csv` in the running app (also available in `scripts/questions-template.csv`).

CSV rules (header optional):

- Columns and order (if no header): `questionText,questionType,subject,difficulty,options,correctAnswer,points`
- `questionText` (required)
- `questionType` (required): `multiple-choice`, `true-false`, or `short-answer`
- `subject` (required)
- `difficulty` (required): `easy`, `medium`, `hard`
- `options` (for multiple-choice): either JSON array string `["A","B"]` or pipe-separated `A|B|C`
- `correctAnswer` (required)
- `points` (optional): integer > 0 (defaults to 1)

Example: see `/questions-template.csv` in the running app or `scripts/questions-template.csv` in this repo.
=======
# fiaCbtSystem2-main
>>>>>>> 21a7306ba1d4f4806157204d868747c76d117404
