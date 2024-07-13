const Product = require('../models/product');
const apiError = require('./apiError');
const { uploadMultipleImages, deleteMultipleImages } = require('./cloudinary');

const creatProduct = async (req, res) => {
    try {
        if (!req?.files?.images.length)
            throw new apiError("Images required");

        const { price, discountType, discountValue } = req.body;

        if (discountType === "percent" && discountValue > 100)
            throw new apiError("Discount value cannot be greater than 100%");

        if (discountType === "amount" && discountValue > Number(price))
            throw new apiError("Discount value cannot be greater than price");

        if (discountType === "none")
            req.body.discountValue = 0;
        if (price <= 0)
            throw new apiError("Price cannot be less than or equal to 0");


        const images = await uploadMultipleImages(req.files.images)

        req.body.createdBy = req.user._id
        req.body.images = images

        const response = await Product.create(req.body);
        if (response)
            return res.status(201).json({
                success: true,
                product: response._id.toString(),
                message: "Sucessfully added"
            });
    } catch (error) {
        console.log(error.stack);
        return res.json(error.message)
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            throw new apiError("Product does not exist");
        }

        await deleteMultipleImages(product.images);

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: `Product id:${product._id} name:${product.title} deleted successfully`,
        });
    } catch (error) {
        console.error(error.stack);
        return res.json(error.message);
    }
};

const updateProduct = async (req, res) => {
    const productId = req.params.id;
    let product = await Product.findById(productId)

    if (!product) {
        throw new apiError("Product doesnot exist")
    }
    if (req?.files?.images.length) {
        await deleteMultipleImages(product.images)
        product.images = await uploadMultipleImages(req.files.images)
    }

    const data = product = await Product.findByIdAndUpdate(productId, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        data,
    });
}

const getProductDetails = async (req, res) => {
   try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
         throw new apiError("Product not found")

    res.status(200).json({
        success: true,
        data: product
    });
}catch(error){
    console.log(error.stack);
    return res.json('')
}
}
const getAllProducts = async (req, res) => {
    const totalProducts = await Product.countDocuments();
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search().filter().pagination();

    const matchedProducts = await new ApiFeatures(Product.find(), req.query)
        .search().filter().query.countDocuments()

    const matchedPages = Math.ceil(matchedProducts / pageSize);

    const products = await apiFeature.query

    res.status(200).json({
        success: true,
        totalProducts,
        matchedPages,
        matchedProducts,
        page,
        pageSize,
        data: products
    })
}

