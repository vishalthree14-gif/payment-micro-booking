# Payment Service

This microservice handles all payment-related operations using Razorpay payment gateway.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get Razorpay credentials:
   - Sign up at https://dashboard.razorpay.com/
   - Go to Settings > API Keys
   - Generate Test/Live keys
   - Copy Key ID and Key Secret

3. Update `.env` file:
```
PORT=5003
MONGODB_URI=mongodb://localhost:27017/booking_payments

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

FRONTEND_URL=http://localhost:3000
```

4. Start the service:
```bash
npm run dev
```

## API Endpoints

### Create Payment Order
**POST** `/api/payments/create-order`

Request:
```json
{
  "amount": 500,
  "bookingId": "booking123",
  "userId": "user123"
}
```

Response:
```json
{
  "success": true,
  "order": {
    "orderId": "order_xyz",
    "amount": 50000,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  }
}
```

### Verify Payment
**POST** `/api/payments/verify`

Request:
```json
{
  "razorpayOrderId": "order_xyz",
  "razorpayPaymentId": "pay_abc",
  "razorpaySignature": "signature_hash"
}
```

Response:
```json
{
  "success": true,
  "msg": "Payment verified successfully",
  "payment": {
    "id": "payment_id",
    "orderId": "order_xyz",
    "paymentId": "pay_abc",
    "bookingId": "booking123",
    "amount": 500,
    "status": "success"
  }
}
```

### Get Payment Status
**GET** `/api/payments/status/:orderId`

### Get Payment by Booking
**GET** `/api/payments/booking/:bookingId`

## Integration with Frontend

1. Install Razorpay SDK in frontend:
```bash
npm install razorpay
```

2. Add Razorpay script to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

3. See example integration in the frontend booking flow.
