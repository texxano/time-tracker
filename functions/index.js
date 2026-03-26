/**
 * Budget Alert Handler - Automatically blocks Firebase operations when costs exceed $1000
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onMessagePublished} = require("firebase-functions/v2/pubsub");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Budget Alert Handler - Triggers when Pub/Sub receives budget alert
exports.budgetAlertHandler = onMessagePublished({
  topic: "firebase-budget-alerts",
  region: "us-central1"
}, async (event) => {
  try {
    logger.info("Budget alert received", {structuredData: true});
    
    // Parse the budget alert data
    const alertData = JSON.parse(Buffer.from(event.data.message.data, 'base64').toString());
    
    logger.info("Alert data:", alertData);
    
    // Check if this is a 100% budget alert ($1000)
    if (alertData.costAmount >= 1000) {
      logger.warn("Budget exceeded $1000, blocking operations");
      
      // Update Firestore to block operations
      const db = admin.firestore();
      await db.collection('system').doc('budgetControl').set({
        operationsBlocked: true,
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        reason: 'Budget exceeded $1000',
        alertAmount: alertData.costAmount
      });
      
      logger.info("Operations blocked successfully");
    } else {
      logger.info(`Budget alert received for $${alertData.costAmount} - no action needed`);
    }
    
  } catch (error) {
    logger.error("Error processing budget alert:", error);
  }
});

// Manual function to reset budget control (for testing/admin use)
exports.resetBudgetControl = onRequest(async (request, response) => {
  try {
    const db = admin.firestore();
    await db.collection('system').doc('budgetControl').set({
      operationsBlocked: false,
      resetAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: 'Manually reset by admin'
    });
    
    logger.info("Budget control reset successfully");
    response.status(200).send("Budget control reset - operations enabled");
    
  } catch (error) {
    logger.error("Error resetting budget control:", error);
    response.status(500).send("Error resetting budget control");
  }
});
