const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let rooms = {
  demo: {
    clues: [
      "This movie was based on a book",
      "One of the actors had a severe alergic reaction that causes him to leave the production half way through filming",
      "An animal in this film earned more then some of the smaller actors/actresses ",
      "This film was one of the first to be shot in technicolor",
      "A famous prop was silver in the book, but was changed to ruby red for the film",
      "the most famous song from the film was almost cut. Luckily it was kept, someone must have wished apon a star",
      "If you don't know where to go with this question you should follow the yellow brick road.",
    ],
    currentClue: 0,
    movie: "Wizard of Oz",
  },
};

// try to get more of these movies in there https://www.imdb.com/list/ls055592025/
const movies = [
  {
    clues: [
      "This movie was based on a book",
      "One of the actors had a severe alergic reaction that causes him to leave the production half way through filming",
      "An animal in this film earned more then some of the smaller actors/actresses ",
      "This film was one of the first to be shot in technicolor",
      "A famous prop was silver in the book, but was changed to ruby red for the film",
      "The most famous song from the film was almost cut. Luckily it was kept, someone must have wished apon a star",
      "The answer you are looking for might be at the yellow brick road.",
      "There is probably a Wizard who could help you, if not, Oz jus don t know what to tell ya",
    ],
    currentClue: 0,
    movie: "Wizard of Oz",
  },
  {
    clues: [
      "The Cinematographer of this film earned himself the nickname 'Prince of darkness' because so many of its scenes are underlit.",
      "A famous prostetic from this movie is on display at in the American Museum of the Moving Image in Queens, New York.",
      "This movie was so popular is sequal was planned before the film finished filming.",
      "Released in 1972 this movie based on a Mario Puzo book as truely stood the test of time",
      "This movie taught as family is first, and friendship is everything.",
      "Don Vito Corleone is going to make you an offer you cant refuse.",
      "If you don't know they answer yet maybe you should ask your Godfather.",
    ],
    currentClue: 0,
    movie: "The Godfather",
  },
  {
    clues: [
      "This movie stars the tallest Oscar winner",
      "This 1994 movie is based on a steven king book",
      "This movie was not a box office hit, it took about a year for it to be the most rented movie of the year.",
      "The narrator of this movie has a voice so beautifal it gets mistaken for God",
      "One of the movies antagonists place the voice of Mr. Crabs on the TV show Sponge bob",
      "The movie had one of the most dramatic escape scenes, but what few people know is the river used in the excape was actually toxic. (according to a chemist)",
      "If you think this questions is rough, just imagine jail, 'Prison isn't a fairy-tale world'",
      "Morgan Freeman and Tim Robbins helped make this movie a IMDB top 250",
      "This story takes place at Shawshank Prison in Mansfiel, Ohio",
    ],
    currentClue: 0,
    movie: "The Shawshank Redemption",
  },
  {
    clues: [
      "The lead actor told the screenwriter 'Your lines are garbage, but I'm the greatest actor in the world, and I can make even garbage sound good'",
      "The villan of the movie isn't viewed as much of a joker. at least not in this film",
      "Are you not entertained by this question?",
      "20,000 arrows were made for a single battle in this movie",
      "to avenge his family's death and getting sold into slavery this Roman General fights in the colosium",
      "as a Gladiator",
    ],
    currentClue: 0,
    movie: "Gladiator",
  },
  {
    clues: [
      "This 1997 movie was set in 1912",
      "Fabrizio and Jack win their way into the story by a poker game",
      "This movie follows a love story of a young couple who just met as they agree to die for eachother. Similar to Shakespear movie that came out a year earlier sharing a cast member",
      "I wish I had as much fun as James Cameron thinks poor people have",
      "If you have already guessed this movie you are the king of the world!",
      "This movie had a titanic budget, and titanic success in the budget",
    ],
    currentClue: 0,
    movie: "Titanic",
  },
  {
    clues: [
      "The Villian of this movie's parents really set him up for failure with his name",
      "The song that won Elton John an Academy Award was originally left out of this movie",
      "New software was written to help animate a scene from this movie, and it took 3 years for software + animation of just that one scenee",
      "This is the best selling home video of all time!",
      "James Earl Jones sadly doesn't live long as king",
      "If you don't know, hakuna matata, it means no worries",
    ],
    currentClue: 0,
    movie: "Lion King",
  },
];

const getRandomMovie = () => {
  newMovie = {};
  const sampleMovie = movies[Math.floor(Math.random() * movies.length)];
  for (let key in sampleMovie) {
    newMovie[key] = sampleMovie[key];
  }
  return newMovie;
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/newGame.html");
});

app.post("/new-game", (req, res) => {
  const id = Math.floor(Math.random() * 1000);
  rooms[id] = getRandomMovie();
  res.redirect(`/g/${id}`);
});

app.get("/g/:gameId", (req, res) => {
  if (rooms[req.params.gameId]) {
    res.sendFile(__dirname + "/index.html");
  } else {
    res.redirect(`/`);
  }
});

updatePlayerStatus = (socket, room) => {
  const playerIDs = io.sockets.adapter.rooms.get(room);
  let players = [...playerIDs].map((player) => {
    const playerSocket = io.sockets.sockets.get(player);
    return {
      playerSocket: playerSocket,
      id: player,
      name: playerSocket.name,
      hasGuess: playerSocket.guess ? true : false,
      guess: playerSocket.guess,
      isHost: playerSocket.isHost,
    };
  });

  const playersForHost = players.map((player) => {
    return {
      name: player.name,
      hasGuess: player.guess ? true : false,
      guess: player.guess,
      isHost: player.isHost,
    };
  });
  const playersForPlayers = players.map((player) => {
    return {
      name: player.name,
      hasGuess: player.guess ? true : false,
      isHost: player.isHost,
    };
  });

  players.forEach((player) => {
    if (player.isHost) {
      player.playerSocket.emit("players", {
        host: true,
        movie: rooms[room].movie,
        players: playersForHost,
      });
    } else {
      player.playerSocket.emit("players", {
        host: false,
        players: playersForPlayers,
      });
    }
  });
};

io.on("connection", (socket) => {
  socket.on("update name", (body) => {
    const room = body.gameId;
    socket.join(room);
    socket.name = body.name;
    socket.guess = "";

    if (io.sockets.adapter.rooms.get(room).size === 1) {
      // you are the only one in the room, guess your host
      socket.isHost = true;
    } else {
      socket.isHost = false;
    }

    updatePlayerStatus(socket, room);
  });

  socket.on("make guess", (body) => {
    socket.guess = body.guess;
    room = body.gameId;
    updatePlayerStatus(socket, room);
  });

  socket.on("next question", (body) => {
    const room = body.gameId;
    const roomInfo = rooms[room];
    const clues = roomInfo["clues"];
    const currentClue = roomInfo["currentClue"];

    if (currentClue < clues.length) {
      io.to(room).emit("new clue", {
        clue: clues[currentClue],
        questionsRemaining: clues.length - 1 - currentClue,
      });
      roomInfo["currentClue"]++;
    }
  });

  socket.on("new question", (body) => {
    room = body.gameId;
    rooms[room] = getRandomMovie();

    const playerIDs = io.sockets.adapter.rooms.get(room);
    let players = [...playerIDs].forEach((player) => {
      const playerSocket = io.sockets.sockets.get(player);
      playerSocket.guess = "";
    });
    updatePlayerStatus(socket, room);
    io.to(room).emit("clear board", "");
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
