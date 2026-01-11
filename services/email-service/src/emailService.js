const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendOrderEmail(userEmail, order) {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: userEmail,
        subject: `Order #${order.orderId} Created`,
        html: `
            <h3>Hi User ${order.userId},</h3>
            <p>Your order has been successfully created:</p>
            <ul>
                <li>Product ID: ${order.productId}</li>
                <li>Quantity: ${order.quantity}</li>
                <li>Price: $${order.price}</li>
                <li>Total: $${order.total}</li>
            </ul>
            <p>Status: ${order.status}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail} for order ${order.orderId}`);
    } catch (err) {
        console.error('Failed to send email', err);
    }
}

module.exports = { sendOrderEmail };
