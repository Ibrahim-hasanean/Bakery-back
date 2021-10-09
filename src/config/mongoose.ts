import mongoose from "mongoose";
import dotnev from "dotenv";
dotnev.config();
const databaseURL: string = process.env.DATABASE_URL as string;
// mongoose.connect(databaseURL).then(() => { console.log("database connected") }).catch((e) => {
//     console.log("Error in database connection");
//     console.log(e);
// })
mongoose.connect("mongodb://localhost:27017/el-madina").then(() => { console.log("database connected") }).catch((e) => {
    console.log("Error in database connection");
    console.log(e);
})

