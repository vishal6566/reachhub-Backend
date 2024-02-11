
const catchAsyncHandler = require("../middlewares/catchAsyncHandles");
const axios = require("axios");
const Player = require("../model/playersModel");
const fs = require("fs");
const { parse } = require("json2csv");
const path = require("path");

async function fetchAndSavePlayersData() {
  try {
    // Drop the players collection before fetching new data
    await Player.collection.drop();

    // Fetch data from the URL
    const response = await axios.get(
      "https://lichess.org/api/player/top/50/classical"
    );
    const playersData = response.data;

    // Save each player data to MongoDB
    for (const playerData of playersData.users) {
      await Player.create({
        id: playerData.id,
        username: playerData.username,
        perfs: playerData.perfs,
        title: playerData.title,
        patron: playerData.patron || false,
        online: playerData.online || false,
      });
    }

    console.log("Players data saved to MongoDB successfully");

    // Fetch saved players data
    const savedPlayers = await Player.find();
    return savedPlayers;
  } catch (error) {
    console.error("Error fetching or saving players data:", error.message);
    throw error; // Rethrow the error to handle it where the function is called
  }
}

const topPlayers =catchAsyncHandler(async (req, res) => {
  try {
    let x = await fetchAndSavePlayersData();
    res.status(200).send(x);
  } catch (error) {
    console.error("Error fetching or saving players data:", error.message);
    res.status(500).send("Error fetching or saving players data");
  }
});

const fetchLast30DaysRating = catchAsyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch data from the API
    const response = await axios.get(
      `https://lichess.org/api/user/${username}/rating-history`
    );
    const ratingHistory = response.data;

    // Extract and filter last 30 days data
    const last30DaysData = ratingHistory.flatMap((performance) => {
      return performance.points
        .filter((point) => {
          const [year, month, day, points] = point;
          const pointDate = new Date(year, month, day); // Adjust month
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return pointDate >= thirtyDaysAgo;
        })
        .map((point) => {
          const [year, month, day, points] = point;
          const formattedDate = `${year}-${month+1}-${day}`;
          return { date: formattedDate, points };
        });
    });

    res.json(last30DaysData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
});


async function fetchRating(username) {
  try {
    // Fetch data from the API
    const response = await axios.get(
      `https://lichess.org/api/user/${username}/rating-history`
    );
    const ratingHistory = response.data;

    // Extract and filter last 30 days data
    const last30DaysData = ratingHistory.flatMap((performance) => {
      return performance.points
        .filter((point) => {
          const [year, month, day, points] = point;
          const pointDate = new Date(year, month, day); // Adjust month
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return pointDate >= thirtyDaysAgo;
        })
        .map((point) => {
          const [year, month, day, points] = point;
          const formattedDate = `${year}-${month}-${day}`;
          return { username, date: formattedDate, points };
        });
    });

    return last30DaysData;
  } catch (error) {
    console.error("Failed to fetch last 30 days data:", error.message);
    throw error;
  }
}

async function generateRatingHistoryCSV(users) {
  try {
    const csvData = [];

    // Iterate through each user
    for (const user of users) {
      // Fetch last 30 days rating history for the user
      const last30DaysData = await fetchRating(user.username);

      // Add each player's data to the CSV data
      last30DaysData.forEach(({ username, date, points }) => {
        csvData.push({
          username,
          "30_days_ago_rating": points,
          date,
          rating: points,
        });
      });
    }

    // Convert data to CSV format
    const csv = parse(csvData);

    // Write CSV data to a file
    const filePath = "rating_history.csv";
    fs.writeFileSync(filePath, csv);

    console.log("Rating history CSV file generated successfully");

    // Return the file path
    return filePath;
  } catch (error) {
    console.error("Failed to generate rating history CSV:", error.message);
    throw error;
  }
}

const convertToCsvfile =catchAsyncHandler(async (req, res) => {
  try {
    // Fetch all players from the database
    const users = await Player.find({});

    // Generate rating history CSV for all users
    const filePath = await generateRatingHistoryCSV(users);

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filePath}`
    );
    res.setHeader("Content-Type", "text/csv");

    // Send the file as a response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
   
  } catch (error) {
    console.error("Error generating rating history CSV:", error.message);
    res.status(500).send("Error generating rating history CSV");
  }
});

module.exports = {
  fetchAndSavePlayersData,
  topPlayers,
  fetchLast30DaysRating,
  convertToCsvfile,
};
