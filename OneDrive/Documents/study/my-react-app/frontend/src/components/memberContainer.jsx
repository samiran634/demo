import { use, useEffect } from "react";
const MemberContainer = (props) => {
    const { member } = props;
useEffect(() => {
    fetch('/memberupload',member)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
}, []);
    
    
    console.log(member);
    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', maxWidth: '300px', margin: '16px auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5em', color: '#333' }}>{member.memberName}</h2>
            <p style={{ margin: '8px 0', fontSize: '1em', color: '#666' }}>amount: ${member.amount}</p>
            <p style={{ margin: '8px 0', fontSize: '1em', color: '#666' }}>
                Have debt with: {member.relationship && member.relationship.type === 'debt' ? member.relationship.memberName : 'none'}
            </p>
            <p style={{ margin: '8px 0', fontSize: '1em', color: '#666' }}>
                Owe: {member.relationship && member.relationship.type === 'owe' ? member.relationship.memberName : 'none'}
            </p>
        </div>
    );
}

export default MemberContainer;