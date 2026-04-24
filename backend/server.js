
const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();
const authRoutes=require('./routes/Authroutes');
const studentRoutes=require('./routes/Studentroutes');
const semesterRoutes=require('./routes/Semesterroutes');
const courseRoutes=require('./routes/Courseroutes');
const gradeRoutes=require('./routes/Graderoutes');
const gpaRoutes=require('./routes/Gparoutes');
const scenarioRoutes=require('./routes/Scenarioroutes');
const reportRoutes=require('./routes/Reportroutes');

const app=express();
const PORT=process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',authRoutes);
app.use('/api/students',studentRoutes);
app.use('/api',semesterRoutes);
app.use('/api',courseRoutes);
app.use('/api',gradeRoutes);
app.use('/api',gpaRoutes);      
app.use('/api',scenarioRoutes);
app.use('/api',reportRoutes);    

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'StudySync server is running' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`StudySync server running on http://localhost:${PORT}`);
});