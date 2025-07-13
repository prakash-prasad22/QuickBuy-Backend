const productRejectTemplate = ({ seller, name , message }) => {
    return `
  <div>
    <p>Dear ${seller},</p>
    <p>We regret to inform you that your product, "${name}", has not been approved for sale on our platform.</p>
    <p>Reason for rejection: ${message}</p>
    <p>We understand that you may have questions or concerns. Please contact our support team at  for further assistance.</p>
    <br />
    <br />
    <p>Thanks,</p>
    <p>The QuickBuy Team</p>
  </div>
  `;
  };
  
  export default productRejectTemplate;