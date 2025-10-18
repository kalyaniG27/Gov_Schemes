// server.js
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import cors from "cors";

const { VoiceResponse } = twilio.twiml;

const app = express();
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json()); // Enable JSON body parsing
app.use(bodyParser.urlencoded({ extended: false }));

// --- Click-to-Call Feature ---

// Ensure you have your credentials in the .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const agentPhoneNumber = process.env.AGENT_PHONE_NUMBER; // The number you want to call (e.g., your support line)

if (!accountSid || !authToken || !twilioPhoneNumber || !agentPhoneNumber) {
  console.error(
    "Twilio environment variables are not set. Please check your .env file."
  );
  // process.exit(1); // You might want to enable this in production
}

const client = twilio(accountSid, authToken);

// --- Existing IVR System ---

// Initial voice greeting
app.post("/voice", (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: "/process-age",
    method: "POST",
  });

  gather.say("Welcome to the Government Scheme Eligibility Service. Please tell your age.");

  res.type("text/xml");
  res.send(twiml.toString());
});

// Step 2 - Process age
app.post("/process-age", (req, res) => {
  const age = req.body.SpeechResult;
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "speech",
    action: "/process-income",
    method: "POST",
  });

  gather.say(`You said age ${age}. Now please tell your monthly income.`);
  res.type("text/xml");
  res.send(twiml.toString());
});

// Step 3 - Process income and give eligibility
app.post("/process-income", (req, res) => {
  const income = req.body.SpeechResult;
  const twiml = new VoiceResponse();

  let eligibleSchemes = [];
  if (parseInt(income) < 10000) {
    eligibleSchemes = ["PM Kisan Yojana", "Jan Dhan Yojana"];
  } else {
    eligibleSchemes = ["Startup India", "Mudra Loan Scheme"];
  }

  twiml.say(`Based on your details, you are eligible for ${eligibleSchemes.join(" and ")}.`);
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
});

// --- New API endpoint for Click-to-Call ---
app.post("/api/make-call", async (req, res) => {
  console.log("Received request for /api/make-call");
  try {
    // This TwiML will be executed when your agent answers the phone.
    const twiml = new VoiceResponse();
    twiml.say("Connecting you to a user who needs assistance. Please wait.");

    // Initiate a call from your Twilio number to your agent's number
    const call = await client.calls.create({
      twiml: twiml.toString(),
      to: agentPhoneNumber,
      from: twilioPhoneNumber,
    });

    console.log(`Call to agent initiated with SID: ${call.sid}`);
    res
      .status(200)
      .send({ message: "Call initiated successfully!", sid: call.sid });
  } catch (error) {
    console.error("Error initiating call:", error);
    // Provide a more specific error message to the frontend if possible
    const errorMessage =
      error.message || "An unknown error occurred with the Twilio API.";
    res.status(500).send({ message: "Failed to initiate call.", error: errorMessage });
  }
});

// Add a root route for basic testing in a browser
app.get("/", (req, res) => {
  res.type("text/plain");
  res.send("Government Scheme Eligibility Service is running.");
});

const PORT = process.env.PORT || 3001; // Use a different port from the React app
app.listen(PORT, () =>
  console.log(`Server with Voice API running on http://localhost:${PORT}`)
);
