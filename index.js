const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ibvkx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('antiqueCars');
        // database collection for services
        const servicesCollection = database.collection('services');
        // database collection for reviews
        const reviewsCollection = database.collection('reviews');
        // database collection for placed orders
        const orderCollection = database.collection('orders');

        // GET API services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // GET API reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // GET a single service aka Car
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('hitting specific service', id)
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })


        // POST API services
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the POST services api', service)

            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // POST API reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the post reviews api', review)

            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result)
        })

        // DELETE API operation
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })

        // Add or confirm Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // my orders
        app.get(`/myOrders/:email`, async (req, res) => {
            const result = await orderCollection
                .find({ email: req.params.email })
                .toArray();
            res.send(result);
        })

        // cancel an order from my orders
        app.delete(`/deleteOrder/:id`, async (req, res) => {
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Antique Cars');
});

app.listen(port, () => {
    console.log('running Antique Cars on port', port);
})