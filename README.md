# OCR Web Server
This web serevr allows to extract the text present in an image, returning the corresponding string. The server is exposed as localhost, becasue the final goal is to be deployed as containeraized application.

## Requirements
Tesseract and the language packs must be installed in the system or in the container.

## Configuration
The web server relies on several environmental variables to configure every aspect of itself. Each topic will be shortly presented with its variables, showing the possible values that can be assigned.
### Express
The server is exposed at `http://localhost:port`, and the `port`can be configured setting the `PORT` variable. It can assume any values in the range `1024-65353`.

The default value is `3001`.
```
PORT=[1024-65353]
```
### Tesseract
The OCR funcitonality is implemented by usign _tesseract_ and it is possible to set different parameters.
#### Language
Set the language of text, using 3-letter string.
```
TESSERACT_LANGUAGE='eng'
TESSERACT_LANGUAGE='ita'
...
```
The default value is `ita`.
#### OCR Engine modes
0. Legacy engine only.
1. Neural nets LSTM engine only.
2. Legacy + LSTM engines.
3. Default, based on what is available.

The default value is `3`.
```
TESSERACT_OEM=3
```
#### Page segmentation modes
0. Orientation and script detection (OSD) only.
1. Automatic page segmentation with OSD.
2. Automatic page segmentation, but no OSD, or OCR.
3. Fully automatic page segmentation, but no OSD. (Default)
4. Assume a single column of text of variable sizes.
5. Assume a single uniform block of vertically aligned text.
6. Assume a single uniform block of text.
7. Treat the image as a single text line.
8. Treat the image as a single word.
9. Treat the image as a single word in a circle.
10. Treat the image as a single character.
11. Sparse text. Find as much text as possible in no particular order.
12. Sparse text with OSD.
13. Raw line. Treat the image as a single text line, bypassing hacks that are Tesseract-specific.

The default value is `1`.
```
TESSERACT_PSM=1
```

## APIs
### Text from image url
This API returns the text recognized from an image passed as url in the reqeust.
The url to call is `/api/ocr/url`, using `POST` methond and passing the url into the body as `url` field. Example of body:
```
{
    url: "http://google.it"
}
```
The url passed must refer to an image, otherwise the response will have status `400 - Bad Request`, reporting the error cause. If the request completes correctly, the response will have status `200 - OK` and the body will contain the recognized text.
```
{
    "text": "Recognized text...\n"
}
````

### Text from image
This API returns the text recognized from an image passed as file in the request.
The url to call is `/api/ocr/image`, using `POST` methond and passing the file into the body as `image` field. Example of body:
```
{
    image: [file]
}
```
The url passed must refer to an image, otherwise the response will have status `400 - Bad Request`, reporting the error cause. If the request completes correctly, the response will have status `200 - OK` and the body will contain the recognized text.
```
{
    "text": "Recognized text...\n"
}
```

### Livingness
The answer should be the string `I am alive` with HTTP code `200 - OK`.

### Readiness
Test of the OCR functionality, checking if it is working properly by extracting text on a test image and comparing the results with the expected value. If everything is ok the answer has HTTP code `200 - OK` and it is formatted as
```
{
    "status": "I am not ready",
    "info": "The OCR engine is working properly"
}
```
If the result is different from the expected value or if the OCR engine has a problem, the answers have HTTP code `500 - Internal server error`, and respectively formatted as
```
{
    "status": "I am not ready",
    "info": "The recognized text is not the expected one"
}
```
```
{
    "status": "I am not ready",
    "info": "[Error message thrown by the OCR engine]"
}
```