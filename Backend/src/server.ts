import app from "./app";
import {connectDB} from './config/db'

import dotenv from 'dotenv'
dotenv.config()
connectDB()

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
