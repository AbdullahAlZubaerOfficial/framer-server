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
    

// Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await userCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Get single user by email
app.get('/users/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const user = req.body;
    const existingUser = await userCollection.findOne({ email: user.email });
    if (existingUser) {
      return res.send({ message: 'User already exists', insertedId: null });
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: 'Internal server error' });
  }
});



// Update user by id (except role)
app.patch('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    // role update disallow
    if ('role' in updateData) delete updateData.role;

    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updateData };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Delete user by id
app.delete('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await userCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: 'Internal server error' });
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
