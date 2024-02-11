const mongoose = require('mongoose');


const playerSchema = new mongoose.Schema({
  id: String,
  username: String,
  perfs: {
    classical: {
      rating: Number,
      progress: Number
    }
  },
  title: String,
  patron: Boolean,
  online: Boolean
});


const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
