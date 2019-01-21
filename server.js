const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');
const ObjectId = require('mongodb').ObjectID;
const app = express();

/* Setting up app middleware, and setting a static path
for public resources. This is generally where things like CSS files go, and client-side JS. */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'Will',
    saveUninitialized: false,
    resave: false
}));

// Just as it looks: sets the view engine to recognize .ejs files for the purpose of dynamic HTML delivery.
app.set('view engine', 'ejs')

var port = process.env.PORT || 3000;
var db;

/* The main connection to mLab, where the database is hosted. 'db' becomes the go-to database object, typically in the form of
"db.collection(<whatever-the-collection-is-called-in-mLab>)". The second argument in function needs to be "client", simply to
conform with current MongoDB syntax. It will, however, ultimately be stored as "db". */
MongoClient.connect('mongodb://wmctavish:ourkingdom5@ds029725.mlab.com:29725/notes-database', (err, client) => {
    if (err) return console.log(err)
    db = client.db('notes-database')
    app.listen(port, () => {
    console.log('Server started on port 3000...')
  })
})

/* Now that the database connection has been established, this tells the app to serve up the "index.html" homepage. Except
it's not really .html, it's .ejs, so that we can work with that template engine,and have page content respond dynamically
to all the interesting functionality of the app. */

/* In addition to serving up "index.ejs", the argument of "{entries: result}" is what really displays the database
contents, after the ".find().toArray()" method pulls all the content from the database. It declares 'entries' as
as an object containing the array results from above (basically all the data), as the 'result'.
Meanwhile the ejs file contains a brief bit of loop code which renders each iteration as
a list item. */

app.get('/', (req,res) => {
      res.sendFile(__dirname + '/index.html')
});

// Renders main page with journal entries
//var entries = [];
//var frontPageGoals = [];

app.get('/entries', async (req,res) => {
  if (req.session.password){
   try {
    const entries = await db.collection('entries').find().sort({date: -1}).toArray(); //.toArray() will return a promise if no callback is specified
    const frontPageGoals = await db.collection('goals').find().toArray();
    res.render('index.ejs', {entries: entries, frontPageGoals: frontPageGoals});
      } catch (err) {
            console.log(err);
            }
    } else {
    res.redirect('/')
    }
});


// Retrieves the current goals & accomplishments from the database

app.get('/goals', async (req,res) => {
  if (req.session.password) {
   try {
    const goals = await db.collection('goals').find().sort({date: -1}).toArray(); //.toArray() will return a promise if no callback is specified
    const accomplishments =await db.collection('accomplishments').find().toArray();
    res.render('goals', {goals: goals, accomplishments: accomplishments});
} catch (err) {
    console.log(err);
}} else {
    res.redirect('/');
    }
});


app.get('/accomplishments', (req,res) => {
    db.collection('accomplishments').find().toArray( (err, result) => {
      if (err) return console.log(err)
      res.render('goals', {accomplishments: result})
    })
});

app.get('/signout', (req,res) => {
  if (req.session.password) {
    req.session.destroy((err) => {
        if (err) return console.log(err);
        console.log('Signed out')
        res.redirect('/');
    })
}});


/* This segment gives the app it's functionality to post new entries to the database, which get immediately rendered by
way of the final "res.redirect('/')" command, which in fact pulls the new entry using the previous app.get() command.
The "action" tag in the ejs file of "/quotes" tells the form to look ath the path defined here, and use the POST method. */
app.post('/entries', (req,res) => {
    db.collection('entries').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('New journal entry added')
      res.redirect('/entries')
    })
});

// Login in the app
app.post('/login', (req,res) => {
    var password = req.body.password;
    db.collection('login').findOne({password: password}, function(err,password) {
        if (err) return console.log(err);
        if (!password) {
        return res.render('loginfailed');
        rq.sessions.password = false;
        } else {
        req.session.password = password;
        console.log('New sign in')
        };
        res.redirect('/entries')
    })
});

// Add a new goal
app.post('/goals', (req,res) => {
    db.collection('goals').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('New goal added')
      res.redirect('/goals')
    })
});


// Check off a completed goal
app.post('/accomplishments', (req, res) => {
  if (req.session.password) {
    db.collection('accomplishments').save(req.body, (err,result) => {
        if (err) return console.log(err);
        console.log("A goal was accomplished")
        res.redirect('/goals')
    })
}});

// Edit an entry
app.put('/entries', (req, res) => {
    db.collection('entries').findOneAndUpdate({_id: ObjectId(req.body._id)}, {
      $set: {
        note: req.body.note
      }},
    (err,result) => {
        if (err) return console.log(err);
        console.log("Entry "+ req.body._id +" was edited");
    })
});

// Delete an entry
app.delete('/entries/:_id', (req, res) => {
  db.collection('entries').findOneAndDelete({_id: ObjectId( req.body._id)},
  (err, result) => {
    if (err) return console.log(err)
    console.log("Entry " + req.body._id + " deleted")
    res.redirect('/')
  })
});

// Delete an goal and add to Accomplishments
app.delete('/goals/:_id', (req, res) => {
  db.collection('goals').findOneAndDelete({_id: ObjectId( req.body._id)},
  (err, result) => {
    if (err) return console.log(err);
    console.log("Entry " + req.body._id + " deleted");
    res.redirect('/goals')
  })
});
