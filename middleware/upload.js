const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const { getMongoUrl } = require('../database/db');

const storage = new GridFsStorage({
    url: getMongoUrl(),
    options: { useNewUrlParser: true },
    file: (request, file) => {
        const match = ["image/png", "image/jpg"];

        if(match.indexOf(file.mimetype) === -1) 
            return null;

        return {
            bucketName: "photos",
            filename: `${Date.now()}-blog-${file.originalname}`
        }
    }
});

module.exports = multer({storage})
