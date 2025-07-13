const productApproveTemplate = ({ seller , name })=>{
    return `
<div>
    <p>Dear ${seller},</p>
    <p>Your product, "${name}", has been approved and is now available for sale on our platform.</p>
    <p>Congratulations! We're excited to showcase your product to our customers.</p>
    <br />
    <br />
    <p>Thanks,</p>
    <p>The QuickBuy Team</p>
</div>
    `
}

export default productApproveTemplate