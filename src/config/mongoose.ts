import mongoose from "mongoose";
import dotnev from "dotenv";
dotnev.config();
const databaseURL: string = process.env.DATABASE_URL as string;
mongoose.connect(databaseURL).then(() => { console.log("database connected") }).catch((e) => {
    console.log("Error in database connection");
    console.log(e);
})
// mongoose.connect("mongodb+srv://ibrahim:481997@cluster0.lyvgk.mongodb.net/bakeryTest?retryWrites=true&w=majority").then(() => { console.log("database connected") }).catch((e) => {
//     console.log("Error in database connection");
//     console.log(e);
// })

