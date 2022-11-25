const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klzscqy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const categoriesCollection = client
      .db("guitarshop")
      .collection("categories");
    const allProductsCollection = client
      .db("guitarshop")
      .collection("allproducts");
    const advertiseProductsCollection = client
      .db("guitarshop")
      .collection("advertise");
    const usersCollection = client.db("guitarshop").collection("users");
    const bookingsCollection = client.db("guitarshop").collection("bookings");

    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });
    app.get("/allproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { categoryId: id };
      const products = await allProductsCollection.find(query).toArray();
      res.send(products);
    });
    app.get("/advertise", async (req, res) => {
      const query = {};
      const advertiseProducts = await advertiseProductsCollection
        .find(query)
        .toArray();
      res.send(advertiseProducts);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const users = await usersCollection.insertOne(user);
      console.log(users);
      res.send(users);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const bookings = await bookingsCollection.insertOne(booking);
      console.log(bookings);
      res.send(bookings);
    });

    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      console.log(email);
      const bookings = await bookingsCollection.find(query).toArray();
      console.log(bookings);
      res.send(bookings);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send();
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("the server is running");
});

app.listen(port, () => {
  console.log(`guitershop server is running on port ${port}`);
});
