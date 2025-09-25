const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config(); // Load .env

const app = express();
const port = process.env.PORT || 3000;

// ✅ Connect to DB
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const allowedOrigins = ['http://localhost:5173']; // Add your frontend URLs
app.use(cors({
  origin: allowedOrigins,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// ✅ Routes
app.use("/user", require("./routes/user"));
app.use("/product", require("./routes/product"));
app.use("/bill", require("./routes/bill"));

app.get('/', (req,res) => {
  res.send('Welcome to the API');
})

// ✅ Server start
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
