// Mock API route to add item to cart
export const addToCart = (req, res) => {
    const {body = {}} = req;
    const {quantity, id} = body;
    const message = `${quantity} Item${quantity === 1 ? "": "'s"} added to cart.`;
    setTimeout(() => {
        res.send({
            id,
            quantity,
            message
        });
    }, process.env.API_DELAY);
};