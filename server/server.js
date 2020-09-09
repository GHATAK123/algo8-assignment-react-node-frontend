const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

let app = express()
let server = http.createServer(app)
let io = socketIO(server)

app.use(express.json())

let Twit = require('twit')
const port = process.env.PORT || 5000;

let T = new Twit({
  consumer_key: "8ea2ciaz4l0fz0W1JUTSt8o2P",
  consumer_secret: "lAWw8jc9JAXuPsdqoXaflQVi21BBbe0Yu1sKsRVWT6iPBurOsE",
  access_token: "3426232066-U4lzezcgndjlkinQjz0CXFoVefahZOMHvMlQgkF",
  access_token_secret: "G7pUIHMokU4x303nTtVY3JL3jJdd95Fmu7e6GwQyywfPQ",
})

let twitterStream
let searchTerm = 'Javascript'

const startTwitterStream = () => {
  if (twitterStream == null) {
    console.log('Creating new Twitter stream.')
    twitterStream = T.stream('statuses/filter', { track: searchTerm })
    twitterStream.on('tweet', function (tweet) {
      io.emit('newTweet', tweet)
    })
  } else {
    console.log('Stream already exists.')
  }
  io.emit('searchTerm', searchTerm)
}

const stopTwitterStream = () => {
  console.log('Stopping Twitter stream.')
  twitterStream.stop()
  twitterStream = null
}

app.post('/updateSearchTerm', (req, res) => {
  searchTerm = req.body.searchTerm
  res.status(200).send({ searchTerm: searchTerm })
  stopTwitterStream()
  startTwitterStream()
})

io.on('connection', (socket) => {
  console.log('Client connected.')
  startTwitterStream()
  socket.on('disconnect', () => {
    if (Object.keys(io.sockets.sockets).length === 0) {
      stopTwitterStream()
    }
    console.log('Client disconnected.')
  })
})

module.exports.server = server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
module.exports.app = app
