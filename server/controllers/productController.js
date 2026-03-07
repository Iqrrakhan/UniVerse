const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

exports.createProduct = async (req, res) => {
  try {
    console.log('BODY:', req.body)
    console.log('FILE:', req.file)

    const { title, description, price, category, itemType } = req.body;

    let imageUrl = ''
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64')
      const dataURI = `data:${req.file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'universe-marketplace'
      })
      imageUrl = result.secure_url
    }

    const product = await Product.create({
      seller: req.user.id,
      title,
      description,
      price,
      category,
      itemType,
      image: imageUrl
    })

    res.status(201).json(product)
  } catch (error) {
    console.log('ERROR:', error)
    res.status(500).json({ message: 'Error uploading item', error: error.message })
  }
}

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name department');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};