import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from '../server/configs/mongodb.js'
import { Webhook } from "svix"
import { clerkWebhooks } from "./controllers/webhooks.js"

//Initialize Express
const app = express()

//connect to db
await connectDB();

//Middlewares
app.use(cors())

//Routes
app.get('/', (req,res)=> res.send("Started") )
app.post('/clerk', express.json(), clerkWebhooks)

//Port
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> {
    console.log(`http://localhost:${PORT}`);
})