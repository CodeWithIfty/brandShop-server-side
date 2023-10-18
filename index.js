const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k4mfqh2.mongodb.net/?retryWrites=true&w=majority`;

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

    const productCollections = client.db("fuddyDB").collection("products");

    app.post("/product", async (req, res) => {
      const product = req.body;
      const result = await productCollections.insertOne(product);
      res.send(result);
    });
    // Get Product Brand Wise
    app.get("/product/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { selectedBrand: brand };
      const result = await productCollections.find(query).toArray();
      res.send(result);
    });
    // Get Single Product
    app.get("/product-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.findOne(query);
      res.send(result);
    });

    // update a signle product
    app.put("/product-update/:_id", async (req, res) => {
      const id = req.params._id;
      const updatedProductData = req.body;
      console.log(updatedProductData)
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          product_img: updatedProductData.product_img,
          product_name: updatedProductData.product_name,
          product_price: updatedProductData.product_price,
          product_description: updatedProductData.product_description,
          selectedBrand: updatedProductData.updatedBrand,
          selectedCategory: updatedProductData.updatedCategory,
          rating: updatedProductData.updatedRating,
        },
      };
      const result = await productCollections.updateOne(filter, updateProduct, options);
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
