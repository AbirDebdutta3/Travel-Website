const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({ // Configuration for Cloudinary
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,   // Use HTTPS for secure connections
});

const storage = new CloudinaryStorage({ // Configuration for Cloudinary storage
  cloudinary: cloudinary,
  params: {
    folder: 'Wanderlust_Images', // The name of the folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed formats
  },
});

module.exports = {
  cloudinary,
  storage,
};