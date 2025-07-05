const express = require('express')
const app = express()
app.use(express.json())
const path = require('path');
const { fetchFullList, ColdEmailCollection } = require('./sendColdEmails');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/get-full-list', async (req, res) => {
    const data = await fetchFullList()
    res.json(data);
});
app.post('/create', async (req, res) => {
  const { recruiter_name, recruiter_email, company_name, company_role } = req.body;
  const newEntry = new ColdEmailCollection({
    recruiter_name,
    recruiter_email,
    company_name,
    company_role
  });
  console.log(newEntry, '--->newEntry')
  await newEntry.save();
  res.json({ message: 'Entry created successfully' });
})
app.get('/start-job', (req, res) => {
    console.log('hhj')
    res.send('Heloo')
})
app.listen(3000, () => {
    console.log('app started at 3000')
})