const axios = require('axios');
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

const defaultTransporterConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'nurenderbishnoi29292929@gmail.com',
        pass: '' // App password
    }
};

// Placeholder for Meta WhatsApp API setup
const processWhatsAppMessage = async (campaignId, customerPhone, customerName, templateBody, couponCode) => {
    try {
        // Here we parse the template body. e.g. "Hi {name}, use {code}"
        let message = templateBody.replace(/{name}/g, customerName || 'Customer');
        message = message.replace(/{code}/g, couponCode || '');

        console.log(`[WHATSAPP MOCK] To: ${customerPhone} | Msg: ${message}`);

        // In production, you would call Meta API:
        /*
        const response = await axios.post(
            `https://graph.facebook.com/v17.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: customerPhone,
                type: "template",
                template: {
                    name: "marketing_blast_1",
                    language: {
                        code: "en_US"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: customerName },
                                { type: "text", text: couponCode }
                            ]
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`
                }
            }
        );
        return { success: true, metaId: response.data.messages[0].id };
        */

        // Simulating network delay
        await new Promise(res => setTimeout(res, 500));
        return { success: true, metaId: 'mock_meta_id_' + Date.now() };

    } catch (err) {
        console.error('[WHATSAPP ERR]', err.message);
        return { success: false, error: err.message };
    }
};



const processEmailMessage = async (campaignId, customerEmail, customerName, templateBody, couponCode, restaurantName, restaurantId) => {
    try {
        if (!customerEmail) {
            return { success: false, error: 'No email address provided' };
        }

        let message = templateBody.replace(/{name}/g, customerName || 'Valued Customer');
        message = message.replace(/{code}/g, couponCode || '');

        const safeRestName = restaurantName || 'Our Restaurant';

        // Fetch custom credentials
        let customTransporter = null;
        let senderEmail = 'nurenderbishnoi29292929@gmail.com';
        try {
            const res = await pool.query("SELECT * FROM marketing_settings WHERE restaurant_id = $1", [restaurantId]);
            if (res.rows.length > 0 && res.rows[0].smtp_user && res.rows[0].smtp_pass) {
                senderEmail = res.rows[0].smtp_user;
                customTransporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: res.rows[0].smtp_user,
                        pass: res.rows[0].smtp_pass
                    }
                });
            }
        } catch (e) { }

        const activeTransporter = customTransporter || nodemailer.createTransport(defaultTransporterConfig);

        console.log(`[EMAIL LIVE] To: ${customerEmail} | Msg: ${message}`);

        const info = await activeTransporter.sendMail({
            from: `"${safeRestName} Marketing" <${senderEmail}>`,
            to: customerEmail,
            subject: `Special Offer from ${safeRestName}!`,
            text: message,
            html: `<div style="font-family: sans-serif; padding: 20px; background: #fafafa; border-radius: 8px;">
                     <h2 style="color: #4CAF50;">Hello ${customerName || 'Customer'},</h2>
                     <p style="font-size: 16px; color: #333;">${message.replace(/\n/g, '<br/>')}</p>
                     <hr style="border: 1px solid #eee; margin: 20px 0;" />
                     <p style="font-size: 12px; color: #999;">This is an automated message from ${safeRestName}.</p>
                   </div>`
        });

        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[EMAIL ERR]', err.message);
        return { success: false, error: err.message };
    }
};

module.exports = {
    processWhatsAppMessage,
    processEmailMessage
};
