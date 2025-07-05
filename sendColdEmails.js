const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const coldEmailListSchema = new mongoose.Schema({
    recruiter_name: { type: String, required: true },
    recruiter_email: { type: String, required: true },
    company_name: { type: String, required: true },
    company_role: { type: String, required: true },
    isApplied: { type: Boolean, default: false },
    isFollowBackSent: { type: Boolean, default: false },
    appliedMailSentOn: { type: Date, default: null },
    followBackSentOn: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }

})

const ColdEmailCollection = mongoose.model("coldemaillist", coldEmailListSchema)

const insertToMongo = async (data) => {
    await ColdEmailCollection.insertMany(data)
    return {
        'message': 'All Data inserted to mongoDb'
    }
}
const fetchFullList = async () => {
    const data = await ColdEmailCollection.find().sort({_id:-1})
    return data
}
const generateEmail = (name, company, role, isFollowUp = false) => {
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


// Updation Logic

// await ColdEmailCollection.updateOne(
//   { _id: data._id },
//   {
//     $set: {
//       isApplied: true,
//       appliedMailSentOn: new Date()
//     }
//   }
// );

const sendMail = async (data) => {


    if (!data?.isApplied) {
        const { subject, text } = await generateEmail(data?.recruiter_name, data?.company_name, data?.company_role, false);
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: data?.recruiter_email, subject, text }, (err, info) => {
            if (err) return log(`❌ Failed to mail ${data?.recruiterName}: ${err.message}`);
            log(`✔️ Mail sent to ${data?.recruiter_name} (${data?.company_name})`);

            // Update Mongo db IsApplied Key 
            data[i]["IsMailSent"] = true;
            data[i]["DaysSinceFirstMail"] = 0;
        });
    }
    return {
        'message': 'Mail sent Successfully'
    }
}



// const finalFunction = async () => {
//     console.log(process.env.MONGO_URL, '---> ')
//     const finalData = await fetchFullList()
//     for (let data of finalData) {
//         await sendMail(data)
//         console.log('--->', data, '90')
//     }
//     // console.log(finalData)
// }

// finalFunction()
// fetch List From Mongo

// connect mail server

// If new Entry, send cold email template

// If already done send follow back template

// Update Mongo db

module.exports={insertToMongo, fetchFullList, ColdEmailCollection}

