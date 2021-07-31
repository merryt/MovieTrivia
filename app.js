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
  {
    clues: [
      "The star of this movie was made a Disney Legend in 1991",
      "This musical is based on a true story... I doubt they sang these songs in real life though",
      "This was one of two iconic musical by the same star that came out about the same time",
      "The leading lady learned to play the gutiar for this film",
      "In the movie the von trap family escapes nazis by frolicing over the alps",
      "If you don't know by this point maybe you should say so long, or farewell, or auf wiedersehen, goodnight",
      "The music in this musical has a certain sound",
    ],
    currentClue: 0,
    movie: "The Sound of Music",
  },
  {
    clues: [
      "The lead character (and person who movie is named after) got his first pair of shoes at 7 years old",
      "Collegite football for Alabama take the narator to the white house",
      "This movie is kinda a movie version of 'we did't start the fire' by billy joel",
      "This movie fills a fair bit of its 142 minute run time with descriptions of shrimp and rain",
      "Due to the success of Lieutenant Dan's character, Gary Sinise has formed a foundation for injured war veterans",
      "This movie taught us life is like a box of chocolates",
      "Run Forrest Run",
    ],
    currentClue: 0,
    movie: "Forrest Gump",
  },
  {
    clues: [
      "This movie follows the love story of a FedEx opperations Exec and a grad student",
      "Lines were written for an inanimate object to make dialogue more realistic, my eyes started sweating when that object got lost",
      "The actor actually grew his beard and facial hair out for parts of this move... like really grew them out",
      "Tom Hanks said that the hardest part of losing so much weight was not eating any French fries for a long time,",
      "It took 21 minutes before they actulla cast anyone away",
    ],
    currentClue: 0,
    movie: "Cast Away",
  },
  {
    clues: [
      "The first easter egg/forshadowing of this movie was 8 years before it was released in Iron Man 2",
      "Wesley snipes was originally hand chosen for the star role but due to special effects limitations the movie wasn't made.",
      "Martin Freeman and Andy Serkis played Bilbo and Gollum, respectively, in The Hobbit Trilogy. They were affectionately known on the predominantly black set as the 'Tolkien White Guys'.",
      "The film won 3 Academy Awards for Best Costume Design, Best Production Design and Best Original Score.",
      "The heros home land is named after the Wakamba tribe of Kenya",
      "This comic book movie shares its title with a dark colored leopard",
    ],
    currentClue: 0,
    movie: "Black Panther",
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

updatePlayerStatus = (socket, room, showAnswers) => {
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

  const playersWithAnswers = players.map((player) => {
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
        players: playersWithAnswers,
      });
    } else if (showAnswers) {
      player.playerSocket.emit("players", {
        host: false,
        movie: rooms[room].movie,
        players: playersWithAnswers,
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

    const showAnswers = false;
    updatePlayerStatus(socket, room, showAnswers);
  });

  socket.on("make guess", (body) => {
    socket.guess = body.guess;
    room = body.gameId;
    const showAnswers = false;
    updatePlayerStatus(socket, room, showAnswers);
  });

  socket.on("show answers", (body) => {
    room = body.gameId;
    const showAnswers = true;
    updatePlayerStatus(socket, room, showAnswers);
  });

  socket.on("next clue", (body) => {
    // host requests new clue
    if (!socket.isHost) return false;

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
    // host asks for new game, body contains gameId
    if (!socket.isHost) return false;

    room = body.gameId;
    rooms[room] = getRandomMovie();

    const playerIDs = io.sockets.adapter.rooms.get(room);
    let players = [...playerIDs].forEach((player) => {
      const playerSocket = io.sockets.sockets.get(player);
      playerSocket.guess = "";
    });
    const showAnswers = false;
    io.to(room).emit("clear board");
    updatePlayerStatus(socket, room, showAnswers);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
