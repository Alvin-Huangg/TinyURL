const express = require('express'); // Importing Express for creating the server
const mongoose = require('mongoose'); // Importing Mongoose for MongoDB interactions
const ShortUrl = require('./models/shortUrl'); // Importing the ShortUrl model
const app = express(); // Creating an Express application

// Connecting to MongoDB database
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000, // Setting MongoDB connection options
});

// Setting the view engine to EJS for rendering dynamic content
app.set('view engine', 'ejs');

// Middleware to parse incoming request bodies as URL encoded data
app.use(express.urlencoded({ extended: false }));

// Route to render the index page with existing short URLs
app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find(); // Fetching all short URLs from the database
  res.render('index', { shortUrls: shortUrls }); // Rendering the index page with short URLs data
});

// Route to handle POST requests for creating new short URLs
app.post('/shortUrl', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl }); // Creating a new short URL entry in the database
  res.redirect('/'); // Redirecting back to the index page after creating the short URL
});

// Route to handle requests for short URLs and redirecting to the full URL
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl }); // Finding the short URL in the database
  if (shortUrl == null) return res.sendStatus(404); // If the short URL is not found, send a 404 status

  // Incrementing clicks and updating short URL if clicks reach a threshold
  if (shortUrl.clicks >= 10) {
    shortUrl.short = generateShortUrl(); // Auto generates a new short link once the "short link" reaches a certain amount of clicks.
    shortUrl.clicks = 0; // Resetting clicks count
    await shortUrl.save(); // Saving the updated short URL
  } else {
    shortUrl.clicks++; // Incrementing clicks count
    await shortUrl.save(); // Saving the updated short URL
  }

  res.redirect(shortUrl.full); // Redirecting to the full URL associated with the short URL
});

// Starting the server on port 3000 (or a dynamic port if set in environment variables)
app.listen(process.env.PORT || 3000, '127.0.0.1', () => {
  console.log('Server is running on port 3000'); // Logging server startup message
});
