import { type NextRequest, NextResponse } from "next/server"

// Mock payment database (same as initiate route)
const paymentTransactions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    console.log("M-Pesa Callback received:", JSON.stringify(callbackData, null, 2))

    // Extract callback data
    const stkCallback = callbackData.Body?.stkCallback
    if (!stkCallback) {
      return NextResponse.json({ success: true })
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode
    const resultDesc = stkCallback.ResultDesc

    // Find the transaction by checkout request ID
    let transaction = null
    for (const [id, txn] of paymentTransactions.entries()) {
      if (txn.callback_data?.CheckoutRequestID === checkoutRequestId) {
        transaction = txn
        break
      }
    }

    if (!transaction) {
      console.error("Transaction not found for checkout request:", checkoutRequestId)
      return NextResponse.json({ success: true })
    }

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || []
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value
      const transactionId = callbackMetadata.find((item: any) => item.Name === "TransactionId")?.Value
      const amountPaid = callbackMetadata.find((item: any) => item.Name === "Amount")?.Value
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === "PhoneNumber")?.Value

      // Update transaction as completed
      transaction.status = "completed"
      transaction.mpesa_transaction_id = transactionId
      transaction.mpesa_receipt_number = mpesaReceiptNumber
      transaction.callback_data = callbackData
      paymentTransactions.set(transaction.id, transaction)

      // Handle different transaction types
      await handleSuccessfulPayment(transaction)
    } else {
      // Payment failed
      transaction.status = "failed"
      transaction.callback_data = callbackData
      paymentTransactions.set(transaction.id, transaction)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    return NextResponse.json({ success: true }) // Always return success to M-Pesa
  }
}

async function handleSuccessfulPayment(transaction: any) {
  try {
    switch (transaction.transaction_type) {
      case "subscription":
        await handleSubscriptionPayment(transaction)
        break
      case "booking_payment":
        await handleBookingPayment(transaction)
        break
      case "commission":
        await handleCommissionPayment(transaction)
        break
    }
  } catch (error) {
    console.error("Error handling successful payment:", error)
  }
}

async function handleSubscriptionPayment(transaction: any) {
  console.log("Subscription payment confirmed:", transaction.mpesa_receipt_number)
}

async function handleBookingPayment(transaction: any) {
  console.log("Booking payment confirmed:", transaction.mpesa_receipt_number)
}

async function handleCommissionPayment(transaction: any) {
  console.log("Commission payment confirmed:", transaction.mpesa_receipt_number)
}
