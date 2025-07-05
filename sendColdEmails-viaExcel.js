
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config();

const logStream = fs.createWriteStream("email_log.txt", { flags: "a" });

function log(message) {
  const time = new Date().toISOString();
  logStream.write(`[${time}] ${message}\n`);
  console.log(message);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateEmail(name, company, role, isFollowUp = false) {
  if (isFollowUp) {
    return {
      subject: `Following Up – ${role} at ${company}`,
      text: `Hi ${name},\n\nJust following up on my previous email regarding the ${role} opportunity at ${company}. I'm still very interested and would love to connect if there's a chance to discuss.\n\nBest,\nSuryash Kumar Jha`
    };
  } else {
    return {
      subject: `Application for ${role} – Suryash Kumar Jha`,
      text: `Hi ${name},\n\nI’m Suryash — a full stack developer experienced in React, Nest.js, and Django. I recently worked at Pramerica Life building a Generative AI chatbot and digital advisor tool.\n\nI’m reaching out to explore opportunities at ${company}. I'd love to contribute as a ${role}, bringing strong ownership and speed.\n\nCan we connect for a quick chat?\n\nBest,\nSuryash Kumar Jha`
    };
  }
}

function sendEmails() {
  const workbook = xlsx.readFile("Recruiters.xlsx");
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const {
      "Recruiter Name": recruiterName,
      "Company Name": company,
      "Role": role,
      "Email": email,
      "IsMailSent": isMailSent,
      "IsFollowUpSent": isFollowUpSent,
      "DaysSinceFirstMail": days,
    } = row;

    if (!email) continue;

    // Initial email
    if (!isMailSent) {
      const { subject, text } = generateEmail(recruiterName, company, role, false);
      transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, text }, (err, info) => {
        if (err) return log(`❌ Failed to mail ${recruiterName}: ${err.message}`);
        log(`✔️ Mail sent to ${recruiterName} (${company})`);
        data[i]["IsMailSent"] = true;
        data[i]["DaysSinceFirstMail"] = 0;
      });
    }
    // Follow-up email
    else if (isMailSent && !isFollowUpSent && days >= 5) {
      const { subject, text } = generateEmail(recruiterName, company, role, true);
      transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, text }, (err, info) => {
        if (err) return log(`❌ Failed follow-up to ${recruiterName}: ${err.message}`);
        log(`🔁 Follow-up sent to ${recruiterName} (${company})`);
        data[i]["IsFollowUpSent"] = true;
      });
    } else if (isMailSent) {
      data[i]["DaysSinceFirstMail"] += 1;
    }
  }

  const newSheet = xlsx.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;
  xlsx.writeFile(workbook, "Recruiters.xlsx");
}

cron.schedule("0 12 * * *", () => {
  log("📬 Starting scheduled email check...");
  sendEmails();
});
