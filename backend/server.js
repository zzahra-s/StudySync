const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`StudySync server running on http://localhost:${PORT}`);
  console.log(`API health check: http://localhost:${PORT}/api/health`);
});
