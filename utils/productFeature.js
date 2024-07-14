const Product = require('../models/product');

const finalCost = async (cartItems) => {
    let subTotal = 0, totalSavings = 0;
    await Promise.all(cartItems.map(async (item) => {
        const response = await costPrice(item.product);
        if (!response) {
            cartItems = cartItems.filter((cartItem) => cartItem.product !== item.product);
        } else {
            const { price, discount } = response;
            subTotal += price * item.quantity;
            totalSavings += discount * item.quantity;
        }
    }));
    return {
        subTotal,
        totalSavings,
        finalPrice: subTotal - totalSavings,
    }
}

const updateStocks = async (cartItems) => {
    await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) return;
        product.stock -= item.quantity;
        product.save();
    }))
}

const costPrice = async (productID) => {
    let price = 0, discount = 0;
    const product = await Product.findById(productID);
    if (!product) return null;
    price += product.price;
    if (product.discountType === "amount")
        discount += product.discountValue;
    else if (product.discountType === "percent")
        discount += (product.discountValue * price) / 100;
    return { price, discount };
}

module.exports = {
    finalCost,
    updateStocks
}