const express = require('express');
const app = express();
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config()

const port = process.env.PORT || 5100;


// middleware 
app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>{
    res.send('boss is sitting on port 5058');
})

app.listen(port,()=>{
    console.log(`Boss is sitting on port ${port}`);
})


// mongodb+srv://zubaerislam703:TF11e5VwBAniDcXK@cluster0.8ckfgub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ckfgub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    const db = client.db("practice");

    const userCollection = db.collection("users");
    

    // user api
    app.get('/users', async(req,res)=> {
        try{
            const result = await userCollection.find().toArray();
            res.send(result);
        } catch(error) {
            console.error("Error fetching users: ", error);
            res.status(500).send({message: 'Internal server error'})
        }
    });























    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
  
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
