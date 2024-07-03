const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware

app.use(cors({
  origin: ['http://localhost:5174','https://hotel-booking-service-250b8.web.app'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hyx8zzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    const roomBooking = client.db('roomBookings').collection('room')
    const postBooking = client.db('roomBookings').collection('order')
    const postReview = client.db('roomBookings').collection('review')
   


    //jwt related api

    app.post('/jwt', async (req, res)=> {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'365d'
      })
      res.cookie('token', token,{
        httpOnly:true,
        secure:true,
        sameSite:'none'
      })
      .send({success:true})
    })


    app.post('/logout', async (req,  res) =>{
      const user = req.body;
      console.log("logout" ,user);
      res.clearCookie('token', {maxAge: 0}).send({success: true})
  })

    //end jwt api
    app.get('/room', async (req, res) => {
      const result = await roomBooking.find(req.body).toArray()
      res.send(result)
    })

    app.get('/room/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await roomBooking.findOne(query)
      res.send(result)
    })

    // //Post Order
    app.post('/post', async (req, res) => {
      const body = req.body;
      const result = await postBooking.insertOne(body)
      res.send(result)
    })
    // //Find the all order
    app.get('/post', async (req, res) => {
      const result = await postBooking.find(req.body).toArray()
      res.send(result)
    })
    // //Find the specific order by id
    app.get('/post/:id', async (req, res) => {
      const result = await postBooking.findOne({ _id: new ObjectId(req.params.id) })
      res.send(result)
    })

    // //Find the specific order by email
    app.get('/post/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await postBooking.find(query).toArray()
      res.send(result)
    })
    app.post('/feedback', async (req, res)=>{
   const body = req.body;
   const review = await postReview.insertOne(body)
   res.send(review)
    })
    app.get('/feedback', async (req, res)=>{
      const find = await postReview.find(req.body).toArray()
      res.send(find)
    })

    app.put('/post/:id', async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) }
      const upDate = req.body;
      const optional = { upsert: true }
      const update = {
        $set: {

          date: upDate.date

        }
      }
      const result = await postBooking.updateOne(filter, update, optional)
      res.send(result)
    })
    // //Delete the specific order
    app.delete('/post/:id', async (req, res) => {
      const result = await postBooking.deleteOne({ _id: new ObjectId(req.params.id) })
      res.send(result)
    })

    // //Update availability in a room
    app.patch('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const availability = req.body
      const query = { _id: new ObjectId(id) }
      const updateDocs = {
        $set: { ...availability }
      }
      const result = await roomBooking.updateOne(query, updateDocs)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("I am busy for the booking hotel")
})

app.listen(port, () => {
  console.log(`Hotel Booking server is on${port}`);
})