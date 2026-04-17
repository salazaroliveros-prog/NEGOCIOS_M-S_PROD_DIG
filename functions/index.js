const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

const accountSid = 'TU_TWILIO_ACCOUNT_SID';
const authToken = 'TU_TWILIO_AUTH_TOKEN';
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Número de Twilio para WhatsApp

exports.sendDownloadLinkOnApproval = functions.firestore
    .document('payment_receipts/{receiptId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Solo actuar si el estado cambió a 'approved'
        if (before.status !== 'approved' && after.status === 'approved') {
            const userPhone = after.userPhone; // Debes guardar el teléfono en el recibo
            const downloadLink = after.downloadLink; // Debes guardar el link en el recibo

            if (userPhone && downloadLink) {
                const message = `¡Tu pago fue aprobado! Descarga tus archivos aquí: ${downloadLink}`;
                try {
                    await twilioClient.messages.create({
                        from: twilioWhatsAppNumber,
                        to: `whatsapp:${userPhone}`,
                        body: message,
                    });
                    console.log('Mensaje enviado a', userPhone);
                } catch (error) {
                    console.error('Error enviando WhatsApp:', error);
                }
            }
        }
        return null;
    });
