const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders); // List Orders
router.post('/', orderController.createOrder);   // Create Order
router.patch('/:orderId/upload-proof', orderController.updateOrder); // Update Order
router.get('/:orderId/upload-proof', orderController.getOrderProof); // Get Order Proof 

module.exports = router;
