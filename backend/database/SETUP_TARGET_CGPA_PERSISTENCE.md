# Target CGPA Calculator - Data Persistence Setup Guide

## Overview
Your Target CGPA Calculator data is now configured to persist in the database. This means calculations will be saved and restored when users refresh the page, just like registered courses.

## Files Created/Modified

### Database Files
1. **`backend/database/add_target_cgpa_tables.sql`** (NEW)
   - Creates `TargetCGPAPlan` table to store main calculation data
   - Creates `TargetCGPASemesters` table to store semester-wise distribution
   - Creates indexes for better query performance

### Backend Files
1. **`backend/controllers/TargetCGPAController.js`** (NEW)
   - `savePlan()` - Saves new Target CGPA plan
   - `getStudentPlans()` - Retrieves latest plan for a student
   - `getPlanById()` - Retrieves specific plan
   - `updatePlan()` - Updates existing plan
   - `deletePlan()` - Deletes a plan

2. **`backend/routes/TargetCGPAroutes.js`** (NEW)
   - POST `/api/students/:studentId/target-cgpa-plan` - Save plan
   - GET `/api/students/:studentId/target-cgpa-plan` - Get latest plan
   - GET `/api/target-cgpa-plan/:planId` - Get specific plan
   - PUT `/api/target-cgpa-plan/:planId` - Update plan
   - DELETE `/api/target-cgpa-plan/:planId` - Delete plan

3. **`backend/server.js`** (MODIFIED)
   - Added import for TargetCGPA routes
   - Registered routes in Express app

### Frontend Files
1. **`frontend/src/pages/TargetCGPACalculator.jsx`** (MODIFIED)
   - Added `useEffect` hook to load saved data on component mount
   - Added `loadSavedPlan()` function to fetch from backend
   - Added `savePlan()` function to persist calculations
   - Updated calculation functions to auto-save results
   - Fixed state management issues (mixed string/number types)
   - Added proper `step` attributes to number inputs

## Setup Instructions

### Step 1: Update Database Schema
Run this SQL script to create the required tables:

```bash
# In SQL Server Management Studio, execute:
# Open: backend/database/add_target_cgpa_tables.sql
# Click Execute (Ctrl+E)
```

**OR use command line:**
```bash
sqlcmd -S YOUR_SERVER -U YOUR_USERNAME -P YOUR_PASSWORD -d StudySync -i "backend\database\add_target_cgpa_tables.sql"
```

### Step 2: Verify Files are in Place
- ✅ `backend/controllers/TargetCGPAController.js` - Created
- ✅ `backend/routes/TargetCGPAroutes.js` - Created
- ✅ `backend/database/add_target_cgpa_tables.sql` - Created
- ✅ `backend/server.js` - Updated
- ✅ `frontend/src/pages/TargetCGPACalculator.jsx` - Updated

### Step 3: Restart Backend Server
```bash
# Terminal in backend folder
npm start
# or
node server.js
```

### Step 4: Test the Feature

1. **Start the app** and navigate to Target CGPA Calculator
2. **Enter your data**:
   - Current CGPA: 3.2
   - Target CGPA: 3.5
   - Remaining Credits: 100
   - Remaining Semesters: 4
   - Total Degree Credits: 120
3. **Click "Continue"** and select distribution method
4. **View results** - Data is now being saved
5. **Refresh the page** - Your data should persist!

## Database Schema

### TargetCGPAPlan Table
```sql
- plan_id (INT, Primary Key, Auto-increment)
- student_id (INT, Foreign Key)
- current_cgpa (DECIMAL 4,2)
- target_cgpa (DECIMAL 4,2)
- remaining_credits (INT)
- remaining_semesters (INT)
- total_degree_credits (INT, Default: 120)
- distribution_method (VARCHAR: 'equal' or 'custom')
- is_achievable (BIT)
- required_sgpa (DECIMAL 4,2, Nullable)
- max_possible_cgpa (DECIMAL 4,2, Nullable)
- created_at (DATETIME, Auto-set)
- updated_at (DATETIME, Auto-set)
```

### TargetCGPASemesters Table (for custom distribution)
```sql
- semester_plan_id (INT, Primary Key, Auto-increment)
- plan_id (INT, Foreign Key → TargetCGPAPlan)
- semester_number (INT)
- semester_name (VARCHAR 100)
- credits (INT)
- required_sgpa (DECIMAL 4,2)
- is_achievable (BIT)
```

## How It Works

### Saving Flow
1. User enters data and clicks "Continue"
2. User selects distribution method
3. Calculations are performed
4. `savePlan()` function is called automatically
5. Data is sent to backend: POST `/api/students/{studentId}/target-cgpa-plan`
6. Backend saves to database with semester breakdown
7. User sees results

### Loading Flow
1. User opens Target CGPA Calculator
2. `useEffect` hook triggers on component mount
3. `loadSavedPlan()` fetches latest plan from backend
4. Data is restored into form fields
5. If plan was already calculated, results are displayed
6. User can see their previous calculations

## API Endpoints Reference

### Save New Plan
```
POST /api/students/:studentId/target-cgpa-plan
Body: {
  currentCGPA: 3.2,
  targetCGPA: 3.5,
  remainingCredits: 100,
  remainingSemesters: 4,
  totalDegreeCredits: 120,
  distributionMethod: "equal",
  isAchievable: true,
  requiredSGPA: 3.65,
  semesters: [...]  // Array of semester objects for custom distribution
}
```

### Get Latest Plan
```
GET /api/students/:studentId/target-cgpa-plan
Response: {
  success: true,
  plan: { ... plan data ... }
}
```

### Update Plan
```
PUT /api/target-cgpa-plan/:planId
Body: { same as POST }
```

### Delete Plan
```
DELETE /api/target-cgpa-plan/:planId
```

## Troubleshooting

### Issue: Data not persisting after refresh
**Solution:**
1. Check if backend is running: `npm start` from backend folder
2. Verify tables were created: Run `SELECT * FROM TargetCGPAPlan;` in SQL Server
3. Check browser console for errors (F12)
4. Check backend logs for SQL errors

### Issue: Form values changing automatically
**Solution:** This has been fixed by:
- Using string state variables for all inputs
- Adding proper `step` attributes to number inputs
- Using explicit parseFloat/parseInt only during calculations

### Issue: "Student ID not available"
**Solution:**
1. Make sure user is logged in
2. Check authentication hook is working
3. Verify `user?.studentId` is available in useAuth

## Future Enhancements

Possible future features:
- Multiple saved plans (save different scenarios)
- Plan comparison tool (compare different calculation methods)
- Export plan as PDF
- Share plan with advisor
- Plan history with timestamps
- Plan templates for common scenarios
