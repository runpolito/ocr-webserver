'use strict';

// Express server imports
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const morgan = require('morgan');
// Environmental variables import
const dotenv = require('dotenv').config();
// Tesseract import
const tesseract = require("node-tesseract-ocr")
// Filesystem import
const fs = require('fs')
// Multer import
const multer = require('multer');

// Environment variables setup
const PORT = process.env.PORT || 3001;
const TESSERACT_LANGUAGE = process.env.TESSERACT_LANGUAGE || 'ita';
const TESSERACT_OEM = process.env.TESSERACT_OEM || 1;
const TESSERACT_PSM = process.env.TESSERACT_PSM || 3;

// Tesseract configuration
const config = {
    lang: TESSERACT_LANGUAGE,   // Language
    oem: TESSERACT_OEM,         // OCR engine mode
    psm: TESSERACT_PSM,         // Page segmentation mode
}
// Multer configuration
const upload = multer({ dest: 'tmp/' })

// Init Express
const app = new express();
const port = PORT;
// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Global variables
const urlRegex = new RegExp('^https?://.*');

// Activate the server
app.listen(PORT, async () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    console.log(`Server listening at port ${PORT}`);
});

// ###################
// ###     API     ###
// ###################

// Get the OCR text from image url
app.post('/api/ocr/url',
    body('url')
        // Check if the parameter is not null
        .exists({ checkNull: true })
        .bail()
        // Check if the id parameter is not empty
        .notEmpty(),
    async (req, res) => {
        // Check if there are validation errors
        const result = validationResult(req);
        if (!result.isEmpty()) {
            let jsonArray = [];
            for (let item of result.array())
                jsonArray.push({
                    param: item.param,
                    error: item.msg,
                    valueReceived: item.value
                })
            res.status(400).json({
                info: 'The server cannot process the request',
                errors: jsonArray
            });
        } else {
            // Path to the temporary file
            const imagePath = './tmp/tmp.png';

            // Check if the url passed is valid
            if (!urlRegex.test(req.body.url)) {
                res.status(400).json('The url is not valid');
                return;
            }
            // Check if the url passed refers to an image
            const response = await fetch(req.body.url);
            const contentType = response.headers.get('content-type');
            if (!contentType === 'image/png' && !contentType === 'image/jpeg') {
                res.status(400).json('The url does not refer to an image');
                return;
            }
            // Get the OCR from the url
            tesseract
                .recognize(req.body.url, config)
                .then((text) => {
                    res.status(200).json({
                        text: text
                    });
                })
                .catch((error) => {
                    res.status(500).json({
                        status: 'OCR engine error',
                        info: error.message
                    });
                });
        }
    });

// Get the OCR text from image file
app.post('/api/ocr/image',
    upload.single('image'),
    async (req, res) => {
        // Check if the image file is present
        if (!req.file) {
            res.status(400).json('The image file is not present');
            return;
        }
        // Check if the file is an image
        if (!req.mimetype === 'image/png' && !req.mimetype === 'image/jpeg') {
            res.status(400).json('The file is not an image');
            return;
        }

        // Get the OCR of the image
        tesseract
            .recognize('./tmp/' + req.file.filename, config)
            .then((text) => {
                res.status(200).json({
                    text: text
                });
            })
            .catch((error) => {
                res.status(500).json({
                    status: 'OCR engine error',
                    info: error.message
                });
            })
            .finally(() => {
                // Remove the temporary file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            });
    });

// Livingness check
app.get('/api/ocr/living', async (req, res) => {
    res.status(200).json('I am alive');
});

// Readiness check
app.get('/api/ocr/ready', async (req, res) => {
    const expectedResult = new RegExp('^Test.*');
    tesseract
        .recognize('./ocrtest.png', config)
        .then((text) => {
            // Compare the text with the expected result
            if (text.match(expectedResult)) {
                res.status(200).json({
                    status: 'I am ready',
                    info: 'The OCR engine is working properly'
                });
            } else {
                res.status(500).json({
                    status: 'I am not ready',
                    info: 'The recognized text is not the expected one'
                });
            }
        })
        .catch((error) => {
            res.status(500).json({
                status: 'I am not ready',
                info: error.message
            });
        });
});