import nodemailer from 'nodemailer';
import { TestRecord, User } from '@shared/api';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(EMAIL_CONFIG);
};

// Generate HTML email template for test results
const generateTestResultsEmail = (user: User, test: TestRecord): string => {
  const testDate = new Date(test.dateISO).toLocaleString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>NEET Test Results - ${user.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .test-info { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #059669; }
        .score { font-size: 24px; font-weight: bold; color: #059669; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 15px 0; }
        .stat-box { background: white; padding: 10px; text-align: center; border-radius: 6px; }
        .stat-number { font-size: 20px; font-weight: bold; color: #059669; }
        .stat-label { font-size: 12px; color: #6b7280; }
        .chapter-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .chapter-table th, .chapter-table td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .chapter-table th { background: #f3f4f6; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NEET Test Results</h1>
          <p>Test completed by ${user.name}</p>
        </div>
        
        <div class="content">
          <div class="test-info">
            <h2>Test Summary</h2>
            <p><strong>Subject:</strong> ${test.subject}</p>
            <p><strong>Date:</strong> ${testDate}</p>
            <p><strong>Total Questions:</strong> ${test.questionCount}</p>
            <div class="score">Score: ${test.score}</div>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${test.correct}</div>
              <div class="stat-label">Correct</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${test.wrong}</div>
              <div class="stat-label">Wrong</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${test.notAttempted}</div>
              <div class="stat-label">Not Attempted</div>
            </div>
          </div>
          
          <h3>Chapter-wise Performance</h3>
          <table class="chapter-table">
            <thead>
              <tr>
                <th>Chapter</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Not Attempted</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(test.byChapter).map(([chapter, stats]) => `
                <tr>
                  <td>${chapter}</td>
                  <td>${stats.correct}</td>
                  <td>${stats.wrong}</td>
                  <td>${stats.notAttempted}</td>
                  <td>${stats.score}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This email was sent from Zenith World NEET Practice Tracker</p>
            <p>Keep practicing to improve your NEET preparation!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send test results email
export const sendTestResultsEmail = async (user: User, test: TestRecord): Promise<boolean> => {
  try {
    if (!user.guardianEmail) {
      console.log('No guardian email provided for user:', user.email);
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Zenith World NEET Tracker" <${EMAIL_CONFIG.auth.user}>`,
      to: user.guardianEmail,
      subject: `NEET Test Results - ${user.name} (${test.subject})`,
      html: generateTestResultsEmail(user, test),
      text: `
        NEET Test Results for ${user.name}
        
        Subject: ${test.subject}
        Date: ${new Date(test.dateISO).toLocaleString()}
        Total Questions: ${test.questionCount}
        Score: ${test.score}
        
        Performance:
        - Correct: ${test.correct}
        - Wrong: ${test.wrong}
        - Not Attempted: ${test.notAttempted}
        
        Chapter-wise Performance:
        ${Object.entries(test.byChapter).map(([chapter, stats]) => 
          `${chapter}: ${stats.correct}C, ${stats.wrong}W, ${stats.notAttempted}NA, Score: ${stats.score}`
        ).join('\n')}
        
        Keep practicing to improve your NEET preparation!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Test results email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send test results email:', error);
    return false;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user: User): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Zenith World NEET Tracker" <${EMAIL_CONFIG.auth.user}>`,
      to: user.email,
      subject: 'Welcome to Zenith World NEET Practice Tracker!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Zenith World</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Zenith World!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Welcome to Zenith World NEET Practice Tracker. We're excited to help you with your NEET preparation journey.</p>
              
              <h3>What you can do:</h3>
              <ul>
                <li>Create and take practice tests for Physics, Chemistry, and Biology</li>
                <li>Track your performance over time</li>
                <li>View detailed analytics and chapter-wise performance</li>
                <li>Get email notifications of your test results (if guardian email is provided)</li>
              </ul>
              
              <p>Start your first test now and begin tracking your progress!</p>
              
              <div class="footer">
                <p>Best of luck with your NEET preparation!</p>
                <p>Zenith World Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Zenith World NEET Practice Tracker!
        
        Hello ${user.name}!
        
        Welcome to Zenith World NEET Practice Tracker. We're excited to help you with your NEET preparation journey.
        
        What you can do:
        - Create and take practice tests for Physics, Chemistry, and Biology
        - Track your performance over time
        - View detailed analytics and chapter-wise performance
        - Get email notifications of your test results (if guardian email is provided)
        
        Start your first test now and begin tracking your progress!
        
        Best of luck with your NEET preparation!
        Zenith World Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};
