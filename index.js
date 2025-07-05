const express= require('express')
const app= express()
app.use(express.json())

app.get('/start-job', (req, res)=>{
    console.log('hhj')
    res.send('Heloo')
})
app.listen(3000, ()=>{
    console.log('app started at 3000')
})