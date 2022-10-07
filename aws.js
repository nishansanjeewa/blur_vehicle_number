var awsSdk = require('aws-sdk')
const blurImage = require('./blurImage')
const fs = require('fs')


const constantParams = {
    Bucket: process.env.BUCKET_NAME
}

awsSdk.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey:  process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
})

const rekognitionClient = new awsSdk.Rekognition()
const s3 = new awsSdk.S3()

function getFileFromS3(key, polygon) {
    try{
        const params = {
            Key: 'images/' + key,
            ...constantParams
        }
        s3.getObject(params, (err, data) => {
            blurImage.analizeImage(data.Body, polygon, key)
        })
    } catch(error){
        throw new Error(error.message)
    }
}

module.exports.uploadFile = (fileName) => {
    const filePath  = 'tmp/' + fileName
    const fileContent = fs.readFileSync(filePath)
    const params = {
        ...constantParams,
        Key: fileName,
        Body: fileContent
    }
    try{
        s3.upload(params, function (err, data) {
            if (err) {
                throw err
            }
            console.log(`File uploaded successfully. ${fileName}`)           
        })
       
    } catch(error){
        throw new Error(error.message)
    }     
}

module.exports.getTextByImage = (imageItem) => {
    const params = {
        Image: {
            S3Object: {
                Bucket: process.env.BUCKET_NAME,
                Name: 'images/' + imageItem.imageName
            },
        },
    }
    try {
        rekognitionClient.detectText(params, function (err, response) {
            if (err) {
                console.log(err, err.stack)
            } else {
                response.TextDetections.forEach(label => {                   
                    if (label.DetectedText === imageItem.carLicense) {
                        getFileFromS3(imageItem.imageName, label.Geometry.Polygon)
                    }
                })
            }
        })
    } catch (error) {
            console.log(error.message)
    }

}

