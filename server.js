const express = require('express');
const fs = require('fs')
const path = require('path');
const { v4: uuidv4 } = require("uuid")

// defining PORT for deployed app and local server
const PORT = process.env.PORT || 3001;

const app = express();

// middleware to read json content and access files in the public folder
app.use(express.json())
app.use(express.static('public'));

// setting html routes 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"))
})
// setting api routes 
app.get('/api/notes', (req, res) => {
    console.log(`${req.method} request recived /api/notes`);
    fs.readFile('db/db.json', "utf8", (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            // making sure that the data is in the right form before sending it back to the client
            res.json(JSON.parse(data))
        }
    })
})

app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request recived /api/notes`);
    // deconstructing the request body items to access the needed values
    const { title, text } = req.body
    // if text and title are given then create a new note object and add it to our db.json file
    if (title && text) {
        const newNote = {
            id: uuidv4(),
            title,
            text,
        };
        fs.readFile('db/db.json', "utf8", (err, data) => {
            if (err) {
                console.log(err)
            }
            else {
                // parsing data into an array of objects instead of a string
                const parsedNotes = JSON.parse(data);
                // pushing new notes into the parsed notes array
                parsedNotes.push(newNote)
                // writting the new parsednotes array to db.json 
                fs.writeFile('db/db.json', JSON.stringify(parsedNotes, null, 4), (Err) =>
                    Err ? console.error(Err) : console.log('new note saved'))
            }
        });
        const response = {
            status: "sucess",
            body: newNote
        }
        console.log(response)
        res.status(201).json(response);
    }
    else {
        res.status(500).json("Error in saving note")
    }
})
// 
app.delete('/api/notes/:id', (req, res) => {
    // setting the variable id to a variable
    const deletedNote = req.params.id
    fs.readFile('db/db.json', "utf8", (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json("Error deleting note")
        }
        else {
            // filtering notes for all those that don't have the id that has been chosen to be deleted
            const parsedNotes = JSON.parse(data).filter(note => {
                return note.id != deletedNote
            })
            // writing a file that has the new array that does not contain the deleted object
            fs.writeFile('db/db.json', JSON.stringify(parsedNotes, null, 4), (Err) =>
                Err ? console.error(Err) : console.log('note deleted'))

            res.send(`${req.method} request called`)
        }
    })
})

app.listen(PORT, () => {
    console.log(`Visit http://localhost:${PORT}`);
})