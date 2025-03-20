const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = 3000;
const mongo_uri=process.env.MONGO_URI
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
mongoose.connect( mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

 
const MemberSchema = new mongoose.Schema({
    memberName: String,
    amount: Number,
    relationship: String
});
const Member = mongoose.model('Member', MemberSchema);
 
app.get('/', (req, res) => {
    res.send('Hello World!');
});

 
app.get("/optimize", async (req, res) => {
    try {
        const members = await Member.find(); 
        const optimizedTransactions = optimizeTransactions(members);
        res.json(optimizedTransactions);
    } catch (error) {
        res.status(500).json({ error: "Error optimizing transactions" });
    }
});

 
app.post("/memberupload", async (req, res) => {
    try {
        const { memberName, amount, relationship } = req.body;
        const newMember = new Member({ memberName, amount, relationship });
        await newMember.save();
        res.json({ message: "Member added successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error saving member data" });
    }
});

 
function optimizeTransactions(members) {
    let balance = {};  

     
    members.forEach(({ memberName, amount, relationship }) => {
        if (!balance[memberName]) balance[memberName] = 0;
        if (!balance[relationship]) balance[relationship] = 0;

        balance[memberName] -= amount;     
        balance[relationship] += amount;    
    });
 
    let debtors = [], creditors = [];
    for (let person in balance) {
        if (balance[person] < 0) debtors.push({ name: person, amount: -balance[person] });
        if (balance[person] > 0) creditors.push({ name: person, amount: balance[person] });
    }

    let transactions = [];
 
    while (debtors.length > 0 && creditors.length > 0) {
        let debtor = debtors[0];
        let creditor = creditors[0];

        let settledAmount = Math.min(debtor.amount, creditor.amount);

        transactions.push({
            from: debtor.name,
            to: creditor.name,
            amount: settledAmount
        });
 
        debtor.amount -= settledAmount;
        creditor.amount -= settledAmount;
 
        if (debtor.amount === 0) debtors.shift();
        if (creditor.amount === 0) creditors.shift();
    }

    return transactions;
}
 
app.listen(PORT, (error) => {
    if (!error)
        console.log(`Server is Successfully Running on port ${PORT}`);
    else 
        console.log("Error occurred, server can't start", error);
});
