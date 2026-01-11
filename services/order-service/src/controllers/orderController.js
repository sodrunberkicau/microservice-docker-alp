
const db = require('../config/database');
const rabbitmq = require('../config/rabbmitmq');
const { uploadToMinio, getFile } = require('../config/minio');
// List Orders
exports.getAllOrders = async (req, res) => {
    try {
        const result = await db.query(`
  SELECT 
    o.id,
    p."name",
    o.product_id,
    p.description,
    o.quantity,
    o.price,
    o.path,
    o.total
  FROM orders o
  LEFT JOIN products p
    ON p.id = o.product_id
`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Create Order
exports.createOrder = async (req, res) => {
    const { userId, items } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const productId = items[0].productId;
        const quantity = items[0].quantity;
        const price = items[0].price;

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, product_id, quantity, price, total, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [userId || 1, productId, quantity, price, total, 'pending']
        );

        const orderId = orderResult.rows[0].id;
        await client.query('COMMIT');

        // -------------------------------
        // Point A: Publish event to RabbitMQ
        // -------------------------------
        const orderEvent = {
            orderId,
            userId,
            productId,
            quantity,
            price,
            total,
            status: 'pending',
            createdAt: new Date()
        };
        console.log(orderEvent);
        rabbitmq.publishOrder(orderEvent);
        console.log(`Order ${orderId} published to RabbitMQ`);

        res.status(201).json({ message: 'Order created', orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};
// Update Order
exports.updateOrder = async (req, res) => {
    const { orderId } = req.params; // dari URL /orders/:orderId/upload-proof
    const { trxProof, fileName, fileType } = req.body;
    if (!orderId || !trxProof || !fileName || !fileType) {
        return res.status(400).json({ message: 'Missing order ID or path' });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Generate nama file unik, misal order_123.png
        const key = `order_${orderId}_${Date.now()}.png`;

        // Upload ke MinIO
        const path = await uploadToMinio('trx', key, trxProof);


        // Update database
        const result = await client.query(
            `UPDATE orders SET path = $2 WHERE id = $1 RETURNING *`,
            [orderId, path]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};
exports.getOrderProof = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Ambil nama file/path dari DB
        const client = await db.connect();
        const result = await client.query('SELECT path FROM orders WHERE id=$1', [orderId]);
        client.release();

        if (!result.rows.length) return res.status(404).json({ message: 'Order not found' });

        const filePath = result.rows[0].path; // misal 'orders/order_30_12345.png'
        if (!filePath) return res.status(404).json({ message: 'File not uploaded yet' });

        const fileBuffer = await minio.getFile('orders', filePath.split('/')[1]); // bucket 'orders', key file
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';

        res.setHeader('Content-Type', mimeType);
        res.send(fileBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get file' });
    }
};

