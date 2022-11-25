const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// Database Connection
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("swap-dealDB").collection("users");
    const brandsCollection = client.db("swap-dealDB").collection("brands");
    const productsCollection = client.db("swap-dealDB").collection("products");

    app.get("/brands", async (req, res) => {
      const query = {};
      const cursor = await brandsCollection.find(query).toArray();
      res.send(cursor);
    });

    app.get("/products/:category", async (req, res) => {
      const categoryId = req.params.category;
      const query = { category: categoryId };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Swap Deal server is running...");
});

app.listen(port, () => {
  console.log(`Server is running...on ${port}`);
});
