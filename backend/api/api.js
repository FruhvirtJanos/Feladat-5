const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });

//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

const readFileJson = async (filepath) => {
    try {
        const raw = await fs.readFile(filepath, 'utf8');
        return JSON.parse(raw);
    }
    catch (error) {
        throw new Error("Olvasási hiba: " + error.message);
    }
}

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        const selectall = await database.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

router.get('/getallelem', async (request, response) => {
    try {
        const utvonal = path.join(__dirname, '../files/elemek.json');
        const file = await readFileJson(utvonal);
        response.status(200).json({
            success: true,
            results: file
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            results: error.message
        });
    }
});

const ismeretlenek = (tomb) => {
    let unknown = [];

    for (let i = 0; i < tomb.length; i++) {
        if (tomb[i].felfedezve == "0") {
            unknown.push(tomb[i]);
        }
    }

    return unknown;
}

router.get('/ismeretlen', async (request, response) => {
    try {
        const utvonal = path.join(__dirname, '../files/elemek.json');
        const file = await readFileJson(utvonal);

        unknown = ismeretlenek(file.felfedez);

        response.status(200).json({
            success: true,
            results: unknown
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            results: error.message
        });
    }
});

const elemnevKeres = (tomb, nev) => {
    let elemek = [];

    for (let i = 0; i < tomb.length; i++) {
        if (tomb[i].elemneve == nev) {
            elemek.push(tomb[i]);
        }
    }

    return elemek;
}

router.get('/getelem/:elemneve', async (request, response) => {
    try {
        const utvonal = path.join(__dirname, '../files/elemek.json');
        const file = await readFileJson(utvonal);

        elemek = elemnevKeres(file.felfedez, request.params.elemneve);
        if (elemek.length > 0) {
            response.status(200).json({
                success: true,
                results: elemek
            });
        }
        else {
            throw new Error("Ilyen elem nem létezik!");
        }
    } catch (error) {
        response.status(500).json({
            success: false,
            results: error.message
        });
    }
});

module.exports = router;
