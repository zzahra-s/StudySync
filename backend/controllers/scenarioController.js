
const GPAScenario = require('../models/GPAScenario');

// heloer to verify the scenario exists and belongs to the loggedin student
const getOwnedScenario = async (scenario_id, user_id) => {
    const scenario = await GPAScenario.findById(scenario_id);
    if (!scenario) return { error: 404, message: 'Scenario not found' };
    if (scenario.student_id !== user_id) return { error: 403, message: 'Access denied' };
    return { scenario };
};

//get/api/students/:studentId/scenarios
const getStudentScenarios = async (req, res) => {
    try {
        const student_id = parseInt(req.params.studentId);
        if (req.user.id !== student_id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const scenarios = await GPAScenario.findByStudentId(student_id);
        res.json(scenarios);
    } catch (error) {
        console.error('Get scenarios error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//post/api/scenarios
const createScenario = async (req, res) => {
    try {
        const { student_id, scenario_name } = req.body;

        if (!student_id || !scenario_name) {
            return res.status(400).json({ message: 'student_id and scenario_name are required' });
        }

        if (req.user.id !== parseInt(student_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const scenario_id = await GPAScenario.create(parseInt(student_id), scenario_name);
        res.status(201).json({ message: 'Scenario created successfully', scenario_id });
    } catch (error) {
        console.error('Create scenario error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//get/api/scenarios/:scenarioId 
const getScenario = async (req, res) => {
    try {
        const scenario_id = parseInt(req.params.scenarioId);
        const { error, message, scenario } = await getOwnedScenario(scenario_id, req.user.id);
        if (error) return res.status(error).json({ message });

        // Include the courses in the same response for convenience
        const courses = await GPAScenario.getScenarioCourses(scenario_id);
        res.json({ ...scenario, courses });
    } catch (error) {
        console.error('Get scenario error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//put/api/scenarios/:scenarioId 
const updateScenario = async (req, res) => {
    try {
        const scenario_id = parseInt(req.params.scenarioId);
        const { scenario_name } = req.body;

        if (!scenario_name) {
            return res.status(400).json({ message: 'scenario_name is required' });
        }

        const { error, message } = await getOwnedScenario(scenario_id, req.user.id);
        if (error) return res.status(error).json({ message });

        await GPAScenario.update(scenario_id, scenario_name);
        res.json({ message: 'Scenario updated successfully' });
    } catch (error) {
        console.error('Update scenario error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//delete/api/scenarios/:scenarioId
const deleteScenario = async (req, res) => {
    try {
        const scenario_id = parseInt(req.params.scenarioId);
        const { error, message } = await getOwnedScenario(scenario_id, req.user.id);
        if (error) return res.status(error).json({ message });

        await GPAScenario.delete(scenario_id);
        res.json({ message: 'Scenario deleted successfully' });
    } catch (error) {
        console.error('Delete scenario error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//get/api/scenarios/:scenarioId/projection 
const getProjection = async (req, res) => {
    try {
        const scenario_id = parseInt(req.params.scenarioId);
        const { error, message } = await getOwnedScenario(scenario_id, req.user.id);
        if (error) return res.status(error).json({ message });

        const projection = await GPAScenario.getProjection(scenario_id);
        if (!projection) {
            return res.json({
                projected_gpa: null,
                message: 'No courses added to this scenario yet. Add courses with expected grades first.',
            });
        }

        res.json(projection);
    } catch (error) {
        console.error('Get projection error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//post/api/scenarios/:scenarioId/courses
const addCourseToScenario = async (req, res) => {
    try {
        const scenario_id = parseInt(req.params.scenarioId);
        const { course_id, expected_grade } = req.body;

        if (!course_id || !expected_grade) {
            return res.status(400).json({ message: 'course_id and expected_grade are required' });
        }

        const { error, message } = await getOwnedScenario(scenario_id, req.user.id);
        if (error) return res.status(error).json({ message });

        const result = await GPAScenario.addCourse(scenario_id, parseInt(course_id), expected_grade);
        res.status(result.updated ? 200 : 201).json({
            message: result.updated
                ? 'Course grade updated in scenario'
                : 'Course added to scenario successfully',
        });
    } catch (error) {
        console.error('Add course to scenario error:', error);
        //fk violation,invalid grade or course_id
        if (error.number === 547) {
            return res.status(400).json({
                message: 'Invalid expected_grade or course_id. Grade must be one of: A, A-, B+, B, B-, C+, C, F',
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// delete/api/scenarios/:scenarioId/courses/:courseId
const removeCourseFromScenario = async (req, res) => {
    try {
        const scenario_id = parseInt(req.params.scenarioId);
        const course_id   = parseInt(req.params.courseId);

        const { error, message } = await getOwnedScenario(scenario_id, req.user.id);
        if (error) return res.status(error).json({ message });

        const deleted = await GPAScenario.removeCourse(scenario_id, course_id);
        if (!deleted) {
            return res.status(404).json({ message: 'Course not found in this scenario' });
        }
        res.json({ message: 'Course removed from scenario successfully' });
    } catch (error) {
        console.error('Remove course from scenario error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getStudentScenarios,
    createScenario,
    getScenario,
    updateScenario,
    deleteScenario,
    getProjection,
    addCourseToScenario,
    removeCourseFromScenario,
};