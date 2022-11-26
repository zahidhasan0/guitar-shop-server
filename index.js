const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const { query } = require("express");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    app.post("/allproducts", async (req, res) => {
      const product = req.body;
      const result = await allProductsCollection.insertOne(product);
      console.log(result);
      res.send(result);
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

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_SECRET, {
          expiresIn: "1d",
        });
        console.log(token);
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.get("/allseller", async (req, res) => {
      const email = req.query.email;
      const query = {
        role: "seller",
      };
      const allSeller = await usersCollection.find(query).toArray();
      res.send(allSeller);
    });
    app.get("/allbuyer", async (req, res) => {
      const email = req.query.email;
      const query = {
        role: "buyer",
      };
      const allSeller = await usersCollection.find(query).toArray();
      res.send(allSeller);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const isUser = await usersCollection.findOne(query);
      if (isUser) {
        return res.send({ message: "Users database already have this user" });
      }
      const users = await usersCollection.insertOne(user);
      console.log(users);
      res.send(users);
    });

    app.put("/users/admin/:id", async (req, res) => {
      //   const userEmail = req.decoded.email;
      //   const query = { email: userEmail };
      //   const user = await usersCollection.findOne(query);
      //   console.log(user);
      //   if (user?.role !== "admin") {
      //     return res.status(403).send({ message: "forbidden access" });
      //   }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      console.log(result);
      res.send(result);
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
