const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const mongoose = require("mongoose");

// READ DATA FROM TWEETS.JSON FILE, UTF8 IS STATIC ENCODER
const tweets = JSON.parse(fs.readFileSync("tweets.json", "utf8"));

const filteredTweets = tweets.map((tweet) => ({
  id_str: tweet.id_str,
  text: tweet.text,
  created_at: tweet.created_at,
  reliability: tweet.reliability,
  relevance_estimation: tweet.relevance_estimation,
  estimated_locations: tweet.estimated_locations,
  image_url: tweet.image_url,
}));

//AUTA TA VRIKA STO INTERNET, BOILERPLATE
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("frontend"));
app.set("json spaces", 2);

//

const CONNECTION_STRING =
  "mongodb+srv://razzly:zirganou04@atlascluster.ebosz8x.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp";

const tweetSchema = new mongoose.Schema({
  id_str: String,
  text: String,
  created_at: String,
  reliability: String,
  relevance_estimation: Number,
  estimated_locations: [
    {
      location_in_text: String,
      location_fullname: String,
      geometry: {
        type: {
          type: String,
          enum: ["Point"], // 'location.type' must be 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
        },
      },
    },
  ],
  image_url: String,
});

//TO KATHE TWEET EXEI TO SCHEMA POU EVALA PANW
const Tweet = mongoose.model("Tweet", tweetSchema);

//AUTA TA VRIKA COPY PASTE, BOILERPLATE
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(CONNECTION_STRING, connectionParams)
  .then(() => {
    console.log("Connected to the database ");

    // Check if there are any tweets in the collection
    Tweet.countDocuments().then((count) => {
      //VLEPW OTI DEN EXW DATA MESA, DILADI TO COUNT === 0, KAI PROSTHETW TA FILTEREDTWEETS
      if (count === 0) {
        Tweet.insertMany(filteredTweets)
          .then(() => console.log("Tweets inserted"))
          .catch((err) => console.error("Error inserting tweets: ", err));
      }
    });
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

// Endpoint to serve the tweets
app.get("/api/tweets", (req, res) => {
  Tweet.find().then((tweets) => {
    console.log("Fetched tweets from the database:", tweets[0]); // Logging the fetched tweets
    res.json(tweets);
  });
});

app.get("/api/tweets/:id", (req, res) => {
  //THE REQ OBJECT HAS THE params.id PROPERTY IN IT. WE USE THIS TO FIND BY ID
  const id = req.params.id;
  Tweet.findById(id).then((tweet) => {
    console.log("Fetched tweets from the database:", tweet); // Logging the fetched tweets
    res.json(tweet);
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
