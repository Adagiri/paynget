# Features
- Topup _done_
- Withdrawal _done_
- View Escrow
- Create Escrow
- Share Escrow
- Join Escrow
- Escrow Messages
- Escrow Interactions
- Buyer CashFlow
- Seller CashFlow
- Cash Flow History
- Admin


##########################################

trade_create
trade_getByUid
trade_requestToJoin
- if funds not enough, you cannot join. after joining, your funds are locked
trade_handleJoinRequest
- funds are deducted from buyer's account, add buyer to the trade, buyer gets an email, push notif, and in-app notif
trade_requestFunds
- buyer gets a notification informing him that the seller requests funds release
trade_releaseFunds
- funds are transferred to the seller, seller gets a notification alert via email, push & app notification
trade_startDispute
- a dispute file is created where an admin, the buyer, and the seller can communicate and resolve issues
trade_closeDispute
- there are 2 options here. The dispute either gets completed or cancelled
***********remember to save transactions**************
# notification scenerios

# AWS account ID
182824972592

# Frontend notes
- Renamed AddCardResponse to PaymentTriggerResponse in the schema
- in PaymentTriggerResponse type. 'amount' field is now 'transactionAmountInKobo'