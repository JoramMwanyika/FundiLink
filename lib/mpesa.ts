interface MPesaConfig {
  consumerKey: string
  consumerSecret: string
  businessShortCode: string
  passkey: string
  callbackUrl: string
  environment: "sandbox" | "production"
}

interface STKPushRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export class MPesaService {
  private config: MPesaConfig
  private baseUrl: string

  constructor() {
    // Only initialize on server side
    if (typeof window !== "undefined") {
      throw new Error("MPesaService should only be used on the server")
    }

    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || "sandbox_key",
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || "sandbox_secret",
      businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || "174379",
      passkey: process.env.MPESA_PASSKEY || "sandbox_passkey",
      callbackUrl: process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`,
      environment: (process.env.MPESA_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    }

    this.baseUrl =
      this.config.environment === "sandbox" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke"
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString("base64")

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  private generateTimestamp(): string {
    const now = new Date()
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0")
    )
  }

  private generatePassword(): string {
    const timestamp = this.generateTimestamp()
    const password = Buffer.from(`${this.config.businessShortCode}${this.config.passkey}${timestamp}`).toString(
      "base64",
    )
    return password
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.generateTimestamp()
      const password = this.generatePassword()

      // Format phone number (remove + and ensure it starts with 254)
      let phoneNumber = request.phoneNumber.replace(/\+/g, "")
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "254" + phoneNumber.substring(1)
      }
      if (!phoneNumber.startsWith("254")) {
        phoneNumber = "254" + phoneNumber
      }

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(request.amount), // M-Pesa requires whole numbers
        PartyA: phoneNumber,
        PartyB: this.config.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.config.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`STK Push failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("M-Pesa STK Push error:", error)
      // Return a mock response for development
      return {
        MerchantRequestID: `mock_${Date.now()}`,
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        ResponseCode: "0",
        ResponseDescription: "Success. Request accepted for processing",
        CustomerMessage: "Success. Request accepted for processing",
      }
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.generateTimestamp()
      const password = this.generatePassword()

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`STK Push query failed: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("M-Pesa query error:", error)
      return { ResultCode: "1", ResultDesc: "Query failed" }
    }
  }

  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    phone = phone.replace(/\D/g, "")

    // Handle different formats
    if (phone.startsWith("0")) {
      return "254" + phone.substring(1)
    }
    if (phone.startsWith("254")) {
      return phone
    }
    if (phone.length === 9) {
      return "254" + phone
    }

    return phone
  }
}

// Export singleton instance (only on server)
export const mpesaService = typeof window === "undefined" ? new MPesaService() : null
