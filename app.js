const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const fortunes = require('./data/fortunes');

const app = express();

// Middleware
app.use(bodyParser.json({limit: '50mb'}));

// Helper Function
const writeFortunes = json => {
    fs.writeFile('./data/fortunes.json', JSON.stringify(json), err => console.log(err));n
};

app.post('/webhook/jra', (req, res) => {
    console.log(req.body)
    console.log('Incident Id:', req.body?.changelog?.id)
    const statusObject = req.body?.changelog?.items?.find((i) => i.field === 'status') || {}
    console.log('Changed From:', statusObject?.fromString)
    console.log('Changed To:', statusObject?.toString)
    res.sendStatus(200)
})

app.get('/fortunes', (req,res) => {
    res.json(fortunes);
})

app.get('/fortunes/random', (req,res) => {
    res.json(fortunes[Math.floor(Math.random() * fortunes.length)]);
})

app.get('/fortunes/:id', (req,res) => {
    if (fortunes.find(f => f.id == req.params.id)) {
        res.json(fortunes.find(f => f.id == req.params.id));
    } else res.send('No Data Found!');
})

app.post('/fortunes/add', (req,res) => {

    const { message, lucky_number, spirit_animal } = req.body;

    const fortune_ids = fortunes.map(f => f.id);

    const new_fortunes = fortunes.concat({
        id: fortunes.length > 0 ? Math.max(...fortune_ids) + 1 : 1,
        message,
        lucky_number,
        spirit_animal
    });

    writeFortunes(new_fortunes);

    res.json(new_fortunes);
})

app.put('/fortunes/:id', (req,res) => {

    const {id} = req.params;

    // const {message, lucky_number, spirit_animal} = req.body

    const old_fortune = fortunes.find(f => f.id == id);

    // Updation based on values
    // if (message) old_fortune.message = message
    // if (lucky_number >= 0) old_fortune.lucky_number = lucky_number
    // if (spirit_animal) old_fortune.spirit_animal = spirit_animal

    // Optimisation of updation
    ['message', 'lucky_number', 'spirit_animal'].forEach(key => {
        if (req.body[key]) old_fortune[key] = req.body[key]
    });

    writeFortunes(fortunes);

    res.json(old_fortune);

})

app.delete('/fortunes/:id', (req, res) => {
    
    const {id} = req.params;

    const new_fortunes = fortunes.filter(f => f.id != id);

    writeFortunes(new_fortunes);

    res.json(new_fortunes);
    
})

// Extra API
app.post('/fortunes/create', (req,res) => {

    if (req.body.length > 0) {

        const fortune_ids = fortunes.map(f => f.id);

        const max = fortune_ids.length > 0 ?
            Math.max(...fortune_ids)
            : 
            0
        ;

        const new_fortunes = fortunes.concat(req.body?.map((fortune, index) => ({
                id: max + index + 1,
                message: fortune.message,
                lucky_number: fortune.lucky_number,
                spirit_animal: fortune.spirit_animal
            })
        ));

        writeFortunes(new_fortunes);

        res.json(new_fortunes);

    } else {

        res.send('Request body is empty!');

    }

})

// Extra API
app.delete('/fortunes', (req,res) => {

    writeFortunes([])

    res.send('All fortunes deleted!')

})

app.post('/cypress', (req, res) => {
    console.log('JSON', req.body?.data)

    res.send('success')
})

module.exports = app