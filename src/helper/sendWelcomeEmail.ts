// mailer.js
import 'dotenv/config'; // ES6 way to instantly load your .env file
import nodemailer from 'nodemailer';

// 1. Configure the Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
}); 



 export  const sendWelcomeEmail = async (targetEmail :string, tempPassword :string) => {
  const mailOptions = {
    from: `"My App Support" <${process.env.EMAIL_USER}>`, 
    to: targetEmail,
    subject: 'Your New Account Credentials',
    text: `Welcome! Your login email is: ${targetEmail}. Your temporary password is: ${tempPassword}. Please change it upon logging in.`,
    html: `
      <h2>Welcome to Our Platform!</h2>
      <p>Your account has been successfully created. Here are your login details:</p>
      <ul>
        <li><b>Email:</b> ${targetEmail}</li>
        <li><b>Temporary Password:</b> ${tempPassword}</li>
      </ul>
      <p><i>For your security, please log in and change this password immediately.</i></p>
    `
  };

  // 3. Use try/catch with await for clean error handling
  try {
   await transporter.sendMail(mailOptions);
  

  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};





 export const sendStudentWelcomeEmail = async (targetEmail: string, tempPassword: string, studentId: string): Promise<void> => {
  const mailOptions = {
    from: `"My App Support" <${process.env.EMAIL_USER}>`, 
    to: targetEmail,
    subject: 'Welcome Aboard! 🚀 Your Student Journey Begins Here',
    text: `Welcome to the community! We're thrilled to have you.\n\nHere is your official Student ID and the keys to access your portal:\n\nStudent ID: ${studentId}\nLogin Email: ${targetEmail}\nTemporary Password: ${tempPassword}\n\nPlease make sure to log in and change your password right away to keep your account secure.\n\nLet the learning begin!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; color: #333;">
        <h2 style="color: #2c3e50;">Welcome Aboard, Explorer! 🚀</h2>
        <p style="font-size: 16px; line-height: 1.5;">We are thrilled to officially welcome you to our learning community. Your student profile is set up and ready to go!</p>
        
        <div style="background-color: #f4f7f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
          <h3 style="margin-top: 0; color: #2c3e50;">Your Official Credentials</h3>
          <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 16px;">
            <li style="margin-bottom: 12px;">🎓 <b>Student ID:</b> <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 4px;">${studentId}</code></li>
            <li style="margin-bottom: 12px;">📧 <b>Email:</b> <a href="mailto:${targetEmail}" style="color: #4CAF50;">${targetEmail}</a></li>
            <li>🔑 <b>Temporary Password:</b> <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #d35400; background: #fdf2e9; padding: 10px; border-radius: 5px;">
          <i>⚠️ <b>Security Notice:</b> Please log in and change your temporary password immediately to secure your account.</i>
        </p>
        
        <p style="font-size: 16px; margin-top: 25px;">Let the learning begin!</p>
        <p style="font-size: 14px; color: #7f8c8d;">Cheers,<br><b>The Support Team</b></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${targetEmail}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

