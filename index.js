const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = 3000;
const ObjectId = require("mongodb").ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iltfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("chill-gamer");
    const userCollection = client.db("chill-gamer").collection("users");
    const watchListCollection = client
      .db("chill-gamer")
      .collection("watchList");

    app.get("/highestRated", async (req, res) => {
      const highestRated = await database
        .collection("reviews")
        .find()
        .sort({ rating: -1 })
        .limit(6)
        .toArray();
      res.send(highestRated);
    });

    app.get("/reviews", async (req, res) => {
      const reviews = await database.collection("reviews").find().toArray();
      res.send(reviews);
    });

    app.get("/reviewDetails/:id", async (req, res) => {
      const id = req.params.id;
      const review = await database
        .collection("reviews")
        .findOne({ _id: new ObjectId(id) });
      res.send(review);
    });

    app.post("/reviews", async (req, res) => {
      const reviewData = req.body;
      console.log(reviewData);
      const result = await database.collection("reviews").insertOne(reviewData);
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      console.log("body", req.body);
      const { email } = req.body;
      const id = req.params.id;
      const result = await database
        .collection("reviews")
        .deleteOne({ _id: new ObjectId(id), email: email });
      res.send(result);
    });

    app.post("/watchList", async (req, res) => {
      const watchListData = req.body;
      const { username, email } = watchListData;
      console.log(username, email);
      const result = await watchListCollection.insertOne(watchListData);
      res.send(result);
    });

    //users
    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const userData = req.body;
      console.log(userData);
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
