/* 1. Set Up Global Variables */

/* 1.1. Get Chat Box Element 
    This element is used to display the chat history and the generated images
*/
const chatBoxElement = document.getElementById("chat-box");

/* 1. Configure Application 
    This configuration object contains the settings for the application 
    It includes the total number of iterations and the rules for the text generator
*/
const configuration = {
  totalIterations: 3,
  textGenerator: {
    rules: {
      sentence: ["The noun verb"],
      noun: ["knight", "monk", "king", "queen", "jester", "sage"],
      verb: [
        "attacked.",
        "prays.",
        "assists.",
        "blesses.",
        "jokes.",
        "ascends.",
        "defends.",
        "demands.",
        "rests.",
      ],
    },
  },
};

/* 2. Set Up Initial State 
    This state object keeps track of the current iteration and the story history 
    The current iteration is used to determine the next step in the story 
    The story history is used to keep track of the story so far
*/
const state = {
  currentIteration: 0,
  storyHistory: [],
};

/* 3. Define Helper Functions */

/* 3.1 Sentence Generator 
    Copy & Pasted from https://fruitful.school/workshops/npc/home/downloads/demo-0204.zip
    This function generates a random sentence based on a set of rules 
    The rules are defined in a configuration object 
    The function uses recursion to generate the sentence
*/
const generateText = () => {
  function generate(symbol) {
    if (!configuration.textGenerator.rules[symbol]) {
      return symbol;
    }
    var expansions = configuration.textGenerator.rules[symbol];
    var randomIndex = Math.floor(Math.random() * expansions.length);
    var expansion = expansions[randomIndex];
    var expansionWords = expansion.split(" ");
    var result = [];
    for (var i = 0; i < expansionWords.length; i++) {
      result.push(generate(expansionWords[i]));
    }
    return result.join(" ");
  }
  return generate("sentence");
};

/* 3.2 Generate Chat Completion 
    This function sends a prompt to the server and returns the completion
    The prompt is sent in the request body as JSON
    The completion is sent back in the response body as JSON
*/
const getChatCompletion = async (prompt) => {
  // Send the prompt to the server
  const response = await fetch("http://localhost:3000/chat-gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
  // Get the completion from the response
  const json = await response.json();
  return json;
};

/* 3.3 Generate Image Element
    This function creates an image element with a given URL
    The URL is used as the source for the image
*/
const generateImageElement = (url) => {
  const imageElement = document.createElement("img");
  imageElement.style.maxWidth = "80vw";
  imageElement.src = url;
  return imageElement;
};

/* 3.4 Generate Chat Element
    This function creates a chat element with a given text
    The text is used as the inner HTML for the chat element
*/
const generateChatElement = (text) => {
  const chatElement = document.createElement("p");
  chatElement.innerHTML = text;
  return chatElement;
};

/* 3.5 Generate Temporary Loading Element
    This function creates a temporary loading element with a given text
    The text is used as the inner HTML for the loading element
*/
const generateTemporaryLoadingElement = (loadingText) => {
  const loadingElement = document.createElement("div");
  loadingElement.classList.add("loading");
  loadingElement.innerHTML = loadingText ? loadingText : "Contemplating...";
  return loadingElement;
};

/* 3.5 Append Element
    This function appends an element to the chat box
    The element is added to the end of the chat history
*/
const appendElement = (element) => {
  chatBoxElement.appendChild(element);
};

/* 3.6 Remove Last Element
    This function removes the last element from the chat box
    This is used to remove temporary loading elements
*/
const removeLastElement = () => {
  chatBoxElement.removeChild(chatBoxElement.lastChild);
};

/* 3.7 Scroll to Bottom
    This function scrolls the chat box to the bottom
    This is used to keep the chat history in view
*/
const scrollToBottom = () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
};

/* 4. Main Loop
    This loop generates a new sentence, sends it to the server, and appends the completion to the chat box
    It continues until the total number of iterations is reached
*/

const loop = async () => {
  // Get Current State
  const { totalIterations } = configuration;
  const { currentIteration, storyHistory } = state;

  // Generate a New Random Sentence
  const input = generateText();

  // Add the New Sentence to the Story History
  storyHistory.push(input);

  // Append the New Sentence to the Chat Box
  appendElement(generateChatElement(input));

  // Append a Temporary Loading Element while Requesting ChatGPT Chat Completion
  appendElement(generateTemporaryLoadingElement());

  /* Send the Prompt to the Server and Get the ChatGPT Completion 
      This is the main part of the loop 
      It sends a prompt to the server and gets the completion 
      The prompt is sent in the request body as JSON 
      The completion is sent back in the response body as JSON
  */

  // If this is the first iteration, describe the beginning of the adventure
  if (currentIteration === 0) {
    // describe the beginning of the adventure
    const chatCompletionInput =
      "You are a very experienced dungeon master. In a complicated fantasy environment, describe the beginning of an adventure that starts as follows in a succint paragraph: " +
      storyHistory.toString().replace("., ", " and ");

    // Send the prompt to the server
    const {
      choices: [choice],
    } = await getChatCompletion(chatCompletionInput);

    // Remove the temporary loading element
    removeLastElement();

    // Add the completion to the story history
    storyHistory.push(choice.message.content);

    // Append the completion to the chat box
    appendElement(generateChatElement(choice.message.content));

    // If this is the last iteration, describe the end of the adventure
  } else if (currentIteration === totalIterations - 1) {
    // describe the end of the adventure
    const chatCompletionInput =
      "You are a very experienced dungeon master describing a story from your party. Keeping mind that this has happened in the past: " +
      storyHistory.slice(0, storyHistory.length - 1).toString() +
      ", please continue with the next plot point, keeping in mind that this is the end of the story, keeping the description to a short paragraph:  " +
      storyHistory[storyHistory.length - 1];

    // Send the prompt to the server
    const {
      choices: [choice],
    } = await getChatCompletion(chatCompletionInput);

    // Remove the temporary loading element
    removeLastElement();

    // Add the completion to the story history
    storyHistory.push(choice.message.content);

    // Append the completion to the chat box
    appendElement(generateChatElement(choice.message.content));

    // Otherwise, Continue the Story
  } else {
    // continue the story
    const chatCompletionInput =
      "You are a very experienced dungeon master describing a story from your party. Keeping mind that this has happened in the past: " +
      storyHistory.slice(0, storyHistory.length - 1).toString() +
      ", please continue with the next plot point, keeping in mind that you are " +
      ((currentIteration + 1) / totalIterations) * 100 +
      "% done with the story, keeping the description to a short paragraph:  " +
      storyHistory[storyHistory.length - 1];

    // Send the prompt to the server
    const {
      choices: [choice],
    } = await getChatCompletion(chatCompletionInput);

    // Remove the temporary loading element
    removeLastElement();

    // Add the completion to the story history
    storyHistory.push(choice.message.content);

    // Append the completion to the chat box
    appendElement(generateChatElement(choice.message.content));
  }

  // The Current Iteration is Complete, Move to the Next Iteration
  state.currentIteration = state.currentIteration + 1;

  /* Update the State and Continue the Loop
      This updates the state with the new iteration and story history 
      It then continues the loop if the current iteration is less than the total iterations
      If it is the final step, it sends the story history to the DALL-E model to generate an image
  */

  if (state.currentIteration < totalIterations) {
    loop();
  } else {
    // Append a Temporary Loading Element while Requesting DALL-E Image Generation
    appendElement(generateTemporaryLoadingElement("Hallucinating..."));

    // Send the story history to the DALL-E model to generate an image
    const response = await fetch("http://localhost:3000/dall-e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: storyHistory.toString() }),
    });

    // Remove the temporary loading element
    removeLastElement();

    // Get the image URL and revised prompt from the response
    const { url, revisedPrompt } = await response.json();

    // Append the image and revised prompt to the chat box
    appendElement(generateImageElement(url));

    // Append the revised prompt to the chat box
    appendElement(generateChatElement(`In summary: ${revisedPrompt}`));
  }
};

/* 5. Main Function
    This function initializes the application and starts the loop
*/
const main = async () => {
  appendElement(generateChatElement("In the beginning..."));
  loop();
};

/* 6. Run the Main Function */
main();
