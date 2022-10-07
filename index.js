require('dotenv').config()
const imageDatabase = require('./database')
var aws = require('./aws')

if (imageDatabase.length > 0) {
   try {
      imageDatabase.forEach(imageItem => {
         aws.getTextByImage(imageItem)
      })

   } catch (error) {
      throw new Error(error.message)
   }
}