const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = 3000;
const mongo_uri=process.env.MONGO_URI
app.use(cors({
    origin: ['http://localhost:5173','https://demo-h0sa8f0h1-samirans-projects-221a41f0.vercel.app/'],  
    credentials: true,  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization']  
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
mongoose.connect( mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

 
  const MemberSchema = new mongoose.Schema({
    memberName: { type: String, required: true },
    amount: { type: Number, required: true },
    relationship: { type: Object, required: true }
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
    console.log(req.body);
    try {
        let { memberName, amount, relationship } = req.body;

        // Normalize the memberName (lowercase to avoid duplicate issues)
        memberName = memberName.trim().toLowerCase();

        let existingMember = await Member.findOne({ memberName });

        if (existingMember) {
            // Update the amount and prevent duplicate relationships
            existingMember.amount = amount;

            // Ensure relationships are unique
            const isExistingRelation = existingMember.relationship.some(
                (rel) => rel.memberName === relationship.memberName
            );

            if (!isExistingRelation) {
                existingMember.relationship.push(relationship);
            }

            await existingMember.save();
            return res.json({ message: "Member updated successfully", member: existingMember });
        } else {
            // Add new member
            const newMember = new Member({
                memberName,
                amount,
                relationship: [relationship] // Store as an array to prevent duplicates
            });
            await newMember.save();
            return res.json({ message: "Member added successfully", member: newMember });
        }
    } catch (error) {
        console.error("Error adding/updating member:", error);
        res.status(500).json({ error: "Error adding/updating member" });
    }
});

app.post("/delete", async (req, res) => {
    console.log("Request body:", req.body);
    try {
        const { memberName } = req.body;

        if (!memberName) {
            return res.status(400).json({ error: "Member name is required" });
        }

        const deletedMember = await Member.findOneAndDelete({ memberName });

        if (!deletedMember) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.json({ message: "Member deleted successfully!" });
    } catch (error) {
        console.error("Error deleting member:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/fetchmembers", async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 }); 
        res.status(200).json(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ error: "Error fetching members" });
    }
});

function optimizeTransactions(members) {
    const balance = {};  

    // Step 1: Remove duplicate debts
    const uniqueMembers = [];
    const seen = new Set();

    members.forEach(({ memberName, amount, relationship }) => {
        const key = `${memberName}-${amount}-${relationship.memberName}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueMembers.push({ memberName, amount, relationship });
        }
    });

    // Step 2: Compute net balance of each person
    uniqueMembers.forEach(({ memberName, amount, relationship }) => {
        if (!balance[memberName]) balance[memberName] = 0;
        const relatedPerson = relationship.memberName; 
        if (!balance[relatedPerson]) balance[relatedPerson] = 0;

        // Reduce amount for debtor and increase for creditor
        balance[memberName] -= amount;  // Person paying money
        balance[relatedPerson] += amount;  // Person receiving money
    });

    const debtors = [];
    const creditors = [];

    // Step 3: Classify debtors and creditors
    for (const [person, amt] of Object.entries(balance)) {
        if (Math.abs(amt) < 0.01) continue;
        if (amt < 0) {
            debtors.push({ name: person, amount: -amt });
        } else {
            creditors.push({ name: person, amount: amt });
        }
    }

    // Step 4: Sort debtors and creditors
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];

    // Step 5: Optimize transactions
    while (debtors.length > 0 && creditors.length > 0) {
        const debtor = debtors[0];
        const creditor = creditors[0];

        const settledAmount = Math.min(debtor.amount, creditor.amount);

        if (settledAmount > 0.01) {
            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: Number(settledAmount.toFixed(2))
            });
        }

        debtor.amount -= settledAmount;
        creditor.amount -= settledAmount;

        if (debtor.amount < 0.01) debtors.shift();
        if (creditor.amount < 0.01) creditors.shift();
    }

    return transactions;
}




 
app.listen(PORT, (error) => {
    if (!error)
        console.log(`Server is Successfully Running on port ${PORT}`);
    else 
        console.log("Error occurred, server can't start", error);
});
