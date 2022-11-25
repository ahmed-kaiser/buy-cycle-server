const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.POST || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fixmo2v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyToken = (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if(!token) {
        res.status(401).send("Unauthorized access");
    }else{
        jwt.verify(token, process.env.JWT_TOKEN, (error, decoded) => {
            if(error) {
                res.status(401).send("Unauthorized access");
            }else if(decoded.email !== req.query.email ) {
                res.status(401).send("Unauthorized access");
            }else{
                next();
            }
        });
    }
};

const run = async() => {
    const userCollections = client.db('BuyCycle').collection('users');
    const categoriesCollections = client.db('BuyCycle').collection('categories');
    const productsCollections = client.db('BuyCycle').collection('products');

    // add new user data to database
    app.post('/users', async(req, res) => {
        const user = await userCollections.findOne({email:req.body.email});
        if(!user) {
            const result = await userCollections.insertOne(req.body);
            res.send(result);
        }
    });

    app.get('/categories', async(req, res) => {
        const categories = await categoriesCollections.find().toArray();
        res.send(categories);
    });

    app.post('/products', async(req, res) => {
        const result = await productsCollections.insertOne(req.body);
        res.send(result);
    });

    app.get('/products', verifyToken, async(req, res) => {
        const query = { ownerEmail: req.query.email }
        const products = await productsCollections.find(query).toArray();
        res.send(products);
    });

    app.delete('/products', async(req, res) => {
        const query = { _id: ObjectId(req.query.id) };
        const result = await productsCollections.deleteOne(query);
        res.send(result);
    });
};

run().catch(err => console.log(err));

app.get('/jwt-token', (req, res) => {
    const token = jwt.sign({email:req.query.email}, process.env.JWT_TOKEN)
    res.send({token:token});
});

app.get('/', (req, res) => {
    res.send("ByCycle server is running");
});

app.listen(port, () => {
    console.log(`listening port ${port}`);
});