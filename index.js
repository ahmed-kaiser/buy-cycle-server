const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.POST || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fixmo2v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    const userCollections = client.db('BuyCycle').collection('users');

    // add new user data to database
    app.post('/users', async(req, res) => {
        const user = await userCollections.findOne({email:req.body.email});
        if(!user) {
            const result = await userCollections.insertOne(req.body);
            res.send(result);
        }
    });

};

run().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send("ByCycle server is running");
});

app.listen(port, () => {
    console.log(`listening port ${port}`);
});