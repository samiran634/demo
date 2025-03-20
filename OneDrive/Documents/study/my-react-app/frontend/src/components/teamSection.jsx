import { useState } from "react";
import MemberContainer from "./memberContainer";

const TeamContainer = () => {
    const [members, setMembers] = useState([]);
    const [memberName, setMemberName] = useState("");
    const [amount, setAmount] = useState(0);
    const [relationshipType, setRelationshipType] = useState("");
    const [personName, setPersonName] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    const [optimizedTransactions, setOptimizedTransactions] = useState([]);

    // Function to optimize transactions
    const optimizeTransactions = async () => {
        try {
            const response = await fetch("/optimize", {
                method: "GET",
            });
            const data = await response.json();
            setOptimizedTransactions(data);
        } catch (error) {
            console.error("Error optimizing transactions:", error);
        }
    };

    return (
        <div className="flex flex-col h-auto w-full max-w-4xl bg-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-amber-700 text-center">Create Your Group</h1>

            {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-gray-600">No members added yet.</p>
                    <button
                        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                        onClick={() => setIsClicked(true)}
                    >
                        Add Member
                    </button>
                </div>
            ) : (
                <>
               
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {members.map((member, index) => (
                        <MemberContainer key={index} member={member} />
                    ))}
                    
                </div>
                    <button
                    className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                    onClick={() => setIsClicked(true)}
                >
                    Add Member
                </button>
                </>
            )}

            {/* Add Member Modal */}
            {isClicked && (
                <div className="flex flex-col bg-blue-100 p-4 rounded-lg mt-4 w-[90%] max-w-sm mx-auto text-black shadow-lg absolute top-20 left-1/2 transform -translate-x-1/2">
                    <h1 className="text-xl font-bold">Add Member</h1>
                    <input
                        type="text"
                        placeholder="Member Name"
                        value={memberName}
                        className="mb-2 bg-gray-100 p-2 rounded border border-gray-300 shadow-sm"
                        onChange={(e) => setMemberName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        className="mb-2 bg-gray-100 p-2 rounded border border-gray-300 shadow-sm"
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                    <select
                        value={relationshipType}
                        className="mb-2 bg-gray-100 p-2 rounded border border-gray-300 shadow-sm"
                        onChange={(e) => setRelationshipType(e.target.value)}
                    >
                        <option value="">Select Type</option>
                        <option value="debt">Debt (They owe me)</option>
                        <option value="owe">Owe (I owe them)</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Person Name"
                        value={personName}
                        className="mb-2 bg-gray-100 p-2 rounded border border-gray-300 shadow-sm"
                        onChange={(e) => setPersonName(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            const newMember = {
                                memberName,
                                amount,
                                relationship: { type: relationshipType, memberName: personName },
                            };
                            setMembers([...members, newMember]);
                            setMemberName("");
                            setAmount(0);
                            setRelationshipType("");
                            setPersonName("");
                            setIsClicked(false);
                        }}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-2 hover:bg-blue-600"
                    >
                        Add Member
                    </button>
                </div>
            )}

            {/* Optimize Transactions Button */}
            {members.length >= 2 && (
                <button
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-green-600"
                    onClick={optimizeTransactions}
                >
                    Optimize Transactions
                </button>
            )}

            {/* Display Optimized Transactions */}
            {optimizedTransactions.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-gray-800">Optimized Transactions:</h2>
                    <ul className="list-disc pl-6 text-gray-700">
                        {optimizedTransactions.map((txn, index) => (
                            <li key={index}>
                                {txn.from} → {txn.to}: ₹{txn.amount}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TeamContainer;
