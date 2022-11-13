const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require("util")
// Helper method generating uniq ids
const uuid = require('./helpers/uuid')
const app = express()

const PORT = 3010;

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET route for homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

// GET route for notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'))
})

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to  ${destination}`));

const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    })
}


app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for all notes`);
    readFromFile('./db/myNote.json').then((data) => res.json(JSON.parse(data)));
})

// receive new note to save on the request body, add it to db.json file, and then return the new note to the client
// give each note a unique id when it's saved
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);

    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            note_id: uuid()
        };

        readAndAppend(newNote, './db/myNote.json');
        res.json(`note added successfully!`)
    } else {
        res.error('error in adding notes!')
    }
})


app.listen(PORT, () =>
    console.log(`app is listen at http://localhost:${PORT}`));