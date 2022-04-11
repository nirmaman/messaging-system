const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey.json')
const { async } = require('q')
const setDoc = require('firebase/firestore')
const PORT = process.env.PORT || 4000

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const db = admin.firestore()

app.post('/create', async (req, res) => {
  try {
    let date_ob = new Date()
    let date = ('0' + date_ob.getDate()).slice(-2)
    let month = ('0' + (date_ob.getMonth() + 1)).slice(-2)
    let year = date_ob.getFullYear()
    console.log(year + '-' + month + '-' + date)
    date = year + '-' + month + '-' + date
    let json = {
      Sender: req.body.Sender,
      Receiver: req.body.Receiver,
      message: req.body.message,
      Subject: req.body.Subject,
      Creation_data: date,
      isRead: false,
    }
    console.log(req.body.Sender)
    db.collection('messages').add(json)
    res.status(200).send('200 messages create')
  } catch {
    res.status(500).send('500 Internal Server Error')
  }
})

// http://localhost:4000/get_all_messages?one=Receiver1
//get all Receiver spesific user
app.get('/get_all_messages', async (req, res) => {
  try {
    const msg = db.collection('messages')
    let Receiver = req.query.one
    const snapshot = await msg.where('Receiver', '==', Receiver).get()
    if (snapshot.empty) {
      res.status(200).send('No matching documents.')
      return
    }
    let back = ''
    //update all the messages to read mode:
    snapshot.forEach((doc) => {
      msg.doc(doc.id).update({
        isRead: true,
      })
      // create the response with back arg:
      back +=
        'Sender: ' +
        doc.data().Sender +
        '\n' +
        'Receiver: ' +
        doc.data().Receiver +
        '\n' +
        'Subject: ' +
        doc.data().Subject +
        '\n' +
        'Message: ' +
        doc.data().message +
        '\n' +
        'Creation_data: ' +
        doc.data().Creation_data +
        '\n' +
        '\n'
    })
    res.status(200).send(back)
  } catch {
    res.status(500).send('500 Internal Server Error')
  }
})
// localhost:4000/get_all_unread?one=reciver1
// get all the unread messages of spesific receiver
app.get('/get_all_unread', async (req, res) => {
  try {
    const msg = db.collection('messages')
    let Receiver = req.query.one
    const snapshot = await msg.where('Receiver', '==', Receiver).where('isRead', '==', false).get()
    if (snapshot.empty) {
      console.log('No matching documents.')
      res.status(200).send('No matching documents.')
      return
    }
    let back = ''
    //update all the messages to read mode:
    snapshot.forEach((doc) => {
      msg.doc(doc.id).update({
        isRead: true,
      })
      // create the response with back arg:
      back +=
        'Sender: ' +
        doc.data().Sender +
        '\n' +
        'Receiver: ' +
        doc.data().Receiver +
        '\n' +
        'Subject: ' +
        doc.data().Subject +
        '\n' +
        'Message: ' +
        doc.data().message +
        '\n' +
        'Creation_data: ' +
        doc.data().Creation_data +
        '\n' +
        '\n'
    })
    res.status(200).send(back)
  } catch {
    res.status(500).send('500 Internal Server Error')
  }
})
//localhost:4000/read_message?subject=this is subject4112
//return the message with the spesific subject
app.get('/read_message', async (req, res) => {
  try {
    const msg = db.collection('messages')
    let subject = req.query.subject
    // console.log(Receiver)
    const snapshot = await msg.where('Subject', '==', subject).get()
    if (snapshot.empty) {
      console.log('No matching documents.')
      res.status(200).send('No matching documents.')
      return
    }
    let back = ''
    snapshot.forEach((doc) => {
      if (!doc.data().isRead) {
        msg.doc(doc.id).update({
          isRead: true,
        })
      }
      back +=
        'Sender: ' +
        doc.data().Sender +
        '\n' +
        'Receiver: ' +
        doc.data().Receiver +
        '\n' +
        'Subject: ' +
        doc.data().Subject +
        '\n' +
        'Message: ' +
        doc.data().message +
        '\n' +
        'Creation_data: ' +
        doc.data().Creation_data +
        '\n' +
        '\n'
    })
    res.status(200).send(back)
  } catch {
    res.status(500).send('500 Internal Server Error')
  }
})

//localhost:4000/delete_message?subject=this is subject12
// delete the message that fit the subject from the user.
app.delete('/delete_message', async (req, res) => {
  try {
    const msg = db.collection('messages')
    let subject = req.query.subject
    const snapshot = await msg.where('Subject', '==', subject).get()
    if (snapshot.empty) {
      console.log('No matching documents.')
      res.status(200).send('No matching documents.')
      return
    }
    let back = ''
    snapshot.forEach((doc) => {
      msg.doc(doc.id).delete()
    })
    res.status(200).send('Message Deleted')
  } catch {
    res.status(500).send('500 Internal Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`Express is working on port ${port}`)
})
