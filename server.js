const express = require('express');
const fs = require('fs')
const path = require('path');
const { v4: uuidv4 } = require("uuid")


const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json())
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"))
})

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

    const { title, text } = req.body

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
                const parsedNotes = JSON.parse(data);

                parsedNotes.push(newNote)

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

app.delete('/api/notes/:id', (req, res) => {
    const deletedNote = req.params.id
    fs.readFile('db/db.json', "utf8", (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json("Error deleting note")
        }
        else {
            const parsedNotes = JSON.parse(data).filter(note => {
                return note.id != deletedNote
            })

            // for (let i = 0; i < parsedNotes.length; i++) {
            //     if (deletedNote === parsedNotes[i].id) {
            //         parsedNotes.splice(parsedNotes[i],1)

                    fs.writeFile('db/db.json', JSON.stringify(parsedNotes, null, 4), (Err) =>
                        Err ? console.error(Err) : console.log('note deleted'))
            //             return 
            //     }

            // }
            res.send(`${req.method} request called`)
        }


        

    })
})

    app.listen(PORT, () => {
        console.log(`Visit http://localhost:${PORT}`);
    })