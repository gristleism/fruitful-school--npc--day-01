/* 1. Import Necessary Libraries */

/* dotenv loads environment variables from a .env file */
import "dotenv/config";
/*  Official OpenAI Library enabling easier access to the OpenAI REST API */
import OpenAI from "openai";
/* Express is a minimal Node.js server framework */
import express from "express";
/* CORS provides easy-to-enable 'Cross-Origin Resource Sharing' for Express Servers */
import cors from "cors";

/* 2. Create the Express Server and openAI Instances */

const app = express();
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

/* 3. Configure The Express Server */

/* 3.1 Enable Cross-Origin Resource Sharing 
    This allows the server to accept requests from any origin 
    This is necessary for the server to accept requests from the client 
*/
app.use(cors());

/* 3.2 Enable JSON Parsing from HTTP Requests 
    This allows the server to parse JSON data from incoming HTTP requests 
    This is necessary for the server to accept JSON data from the client   
*/
app.use(express.json());

/* 4. Create the Server Routes */

/* 4.1. Create a Route for ChatGPT Completions
    This route sends a prompt to the ChatGPT model and returns the completion 
    The prompt is sent in the request body as JSON 
    The completion is sent back in the response body as JSON 
*/

app.post("/chat-gpt", async (req, res) => {
  // Get the prompt from the request body
  const prompt = req.body.prompt;
  // Send the prompt to the ChatGPT model
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });
  // Send the completion back in the response
  res.send(chatCompletion);
});

/* 4.2. Create a Route for DALL-E Image Generation
    This route sends a prompt to the DALL-E model and returns the image 
    The prompt is sent in the request body as JSON 
    The image URL and revised prompt are sent back in the response body as JSON 
*/

app.post("/dall-e", async (req, res) => {
  // Get the prompt from the request body
  const prompt = req.body.content;
  // Send the prompt to the DALL-E model
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  // Send the image URL and revised prompt back in the response
  const url = response.data[0].url;
  const revisedPrompt = response.data[0].revised_prompt;
  res.send({ url, revisedPrompt });
});

/* 5. Run the Server */
app.listen(3000, () => {
  console.log(`Express Server listening on port ${3000}`);
});
