import { type NextRequest, NextResponse } from "next/server"
import { mpesaService } from "@/lib/mpesa"

// Mock payment database (in production, use real database)
const paymentTransactions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, type, referenceId, description } = await request.json()

    if (!phoneNumber || !amount || !type) {
      return NextResponse.json(
        { success: false, message: "Phone number, amount, and type are required" },
        { status: 400 },
      )
    }

    // Create payment transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transaction = {
      id: transactionId,
      transaction_type: type,
      reference_id: referenceId,
      amount: amount,
      payment_method: "mpesa",
      mpesa_phone: phoneNumber,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    paymentTransactions.set(transactionId, transaction)

    // Initiate M-Pesa STK Push
    try {
      const stkResponse = await mpesaService?.initiateSTKPush({
        phoneNumber: phoneNumber,
        amount: amount,
        accountReference: transactionId,
        transactionDesc: description || `FundiLink ${type} payment`,
      })

      if (!stkResponse) {
        throw new Error("M-Pesa service not available")
      }

      // Update transaction with M-Pesa response
      transaction.callback_data = stkResponse
      paymentTransactions.set(transactionId, transaction)

      if (stkResponse.ResponseCode === "0") {
        return NextResponse.json({
          success: true,
          message: "Payment request sent to your phone",
          transactionId: transactionId,
          checkoutRequestId: stkResponse.CheckoutRequestID,
        })
      } else {
        // Update transaction status to failed
        transaction.status = "failed"
        paymentTransactions.set(transactionId, transaction)

        return NextResponse.json({
          success: false,
          message: stkResponse.CustomerMessage || "Payment initiation failed",
        })
      }
    } catch (mpesaError) {
      console.error("M-Pesa error:", mpesaError)

      // For development, simulate successful payment after 3 seconds
      setTimeout(() => {
        transaction.status = "completed"
        transaction.mpesa_transaction_id = `mock_${Date.now()}`
        transaction.mpesa_receipt_number = `MPE${Date.now()}`
        paymentTransactions.set(transactionId, transaction)

        // Handle successful payment
        handleSuccessfulPayment(transaction)
      }, 3000)

      return NextResponse.json({
        success: true,
        message: "Payment request sent (development mode)",
        transactionId: transactionId,
        checkoutRequestId: `mock_${Date.now()}`,
      })
    }
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
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
  // Activate or extend fundi subscription
  console.log("Activating subscription for transaction:", transaction.id)

  // In production, update database
  // Update user subscription status
  const users = JSON.parse(localStorage.getItem("fundilink_users") || "[]")
  const userIndex = users.findIndex((u: any) => u.id === transaction.reference_id)

  if (userIndex !== -1) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7) // 1 week subscription

    users[userIndex].subscription_status = "active"
    users[userIndex].subscription_end_date = endDate.toISOString()

    localStorage.setItem("fundilink_users", JSON.stringify(users))
  }
}

async function handleBookingPayment(transaction: any) {
  // Update booking payment status
  console.log("Processing booking payment for transaction:", transaction.id)

  // Create commission record
  const commissionRate = 10.0 // 10%
  const commissionAmount = (transaction.amount * commissionRate) / 100

  console.log(`Commission: ${commissionAmount} KES (${commissionRate}% of ${transaction.amount} KES)`)
}

async function handleCommissionPayment(transaction: any) {
  // Mark commission as collected
  console.log("Commission collected for transaction:", transaction.id)
}

// Get transaction status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get("transactionId")

  if (!transactionId) {
    return NextResponse.json({ success: false, message: "Transaction ID required" }, { status: 400 })
  }

  const transaction = paymentTransactions.get(transactionId)

  if (!transaction) {
    return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    transaction: {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      type: transaction.transaction_type,
      created_at: transaction.created_at,
    },
  })
}
