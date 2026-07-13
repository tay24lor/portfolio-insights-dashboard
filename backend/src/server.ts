import app from './app';
console.log("BACKEND RUNNING FROM:", process.cwd());

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
