import {useState  } from "react";

const ExistingMemberContainer = ({ member, onDelete }) => {
    const [isClicked,setIsClicked]=useState(true);
    console.log(member);

    const handleDelete = () => {
        fetch('https://demo-iipo.onrender.com/delete', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ memberName: member.memberName })  
        })
        .then(response => response.json())
        .then(data => {
            console.log("Delete Response:", data);
            if (onDelete) onDelete(member.memberName);  
        })
        .catch(error => console.error("Error deleting member:", error));
        setIsClicked(false);
    };

    return (
        <>
        {
            isClicked &&
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                maxWidth: '300px',
                margin: '16px auto',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5em', color: '#333' }}>
                    {member.memberName}
                </h2>
                <p style={{ margin: '8px 0', fontSize: '1em', color: '#666' }}>
                    Amount: ${member.amount}
                </p>
                <p style={{ margin: '8px 0', fontSize: '1em', color: '#666' }}>
                    Have debt with: {member.relationship[0]?.type === 'debt' ? member.relationship[0].memberName : 'none'}
                </p>
                <p style={{ margin: '8px 0', fontSize: '1em', color: '#666' }}>
                    Owe: {member.relationship[0]?.type === 'owe' ? member.relationship[0].memberName : 'none'}
                </p>
                
                <button onClick={handleDelete} style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                    Delete
                </button>
            </div>
        }
        </>
     
    );
};

export default ExistingMemberContainer;
