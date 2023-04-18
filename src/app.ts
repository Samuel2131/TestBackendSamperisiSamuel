
import express from "express";
import courses from "./routes/courses";
import users from "./routes/users"

export const app = express();
app.use(express.json());
app.use("/v1/courses", courses);
app.use("/v1/users", users);

app.listen(process.env.PORT || 3001, async () => {
    console.log("Server is running...");
});