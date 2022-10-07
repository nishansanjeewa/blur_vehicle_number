const gm = require('gm').subClass({ imageMagick: true })
const aws = require('./aws')


module.exports.analizeImage = function (file, polygon, imageName) {
    try {
        const minXPolygon = polygon.reduce(function (prev, curr) {
            return prev.X < curr.X ? prev : curr
        })

        const maxXPolygon = polygon.reduce(function (prev, curr) {
            return prev.X > curr.X ? prev : curr
        })

        const minYPolygon = polygon.reduce(function (prev, curr) {
            return prev.Y < curr.Y ? prev : curr
        })

        const maxYPolygon = polygon.reduce(function (prev, curr) {
            return prev.Y > curr.Y ? prev : curr
        })

        const img = gm(file, 'image.jpg')
        img
            .size(function (err, value) {
                const newImageName = 'blur_image_' + imageName
                const blurWidth = (maxXPolygon.X - minXPolygon.X) * value.width
                const blurHeight = (maxYPolygon.Y - minYPolygon.Y) * value.height
                const startPosition = minXPolygon.X * value.width
                const endPosition = minYPolygon.Y * value.height
                img.region(blurWidth, blurHeight, startPosition, endPosition).blur(0, 50).write('tmp/' + newImageName, function (err) {
                    if (err) return handle(err)
                    aws.uploadFile(newImageName)
                    console.log('Created an image from a Buffer!')
                })

            })
    } catch (error) {
        throw new Error(error.message)
    }
}