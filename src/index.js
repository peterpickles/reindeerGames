var reindeers = {
  "dasher": {
    "personality_trait": "loves to go fast",
    "skill": "sewing"
  },
  "dancer": {
    "personality_trait": "is completely extroverted",
    "skill": "sewing"
  },
  "prancer": {
    "personality_trait": "is a bit vain, though affecionate",
    "skill": "prancing of course"
  },
  "vixen": {
    "personality_trait": "is slightly tricky",
    "skill": "good at magic"
  },
  "comet": {
    "personality_trait": "is handsome and easy-going",
    "skill": "good with kids"
  },
  "cupid": {
    "personality_trait": "is affectionate",
    "skill": "bring people together"
  },
  "donner": {
    "personality_trait": "is loud",
    "skill": "electrifies others"
  },
  "blitzen": {
    "personality_trait": "is fast as a bolt",
    "skill": "good at singing"
  },
  "rudolph": {
    "personality_trait": "is a little down on himself",
    "skill": "has a nose that glows"
  },
  "olive": {
    "personality_trait": "admits when she's wrong",
    "skill": "good at hide-and-go-seek"
  }
}

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    /**
     * Uncomment this if statement and populate with your skill's application ID to
     * prevent someone else from configuring a skill that sends requests to this function.
     */

    if (event.session.application.applicationId !== "amzn-id") {
      context.fail("Invalid Application ID");
    }

    if (event.session.new) {
      onSessionStarted({ requestId: event.request.requestId }, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
          context.succeed(buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === "IntentRequest") {
      onIntent(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
          context.succeed(buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
  // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

  var intent = intentRequest.intent
  var intentName = intentRequest.intent.name;

  //Logic when each intent is triggered
  if (intentName == "ReindeerIntent") {
    handleReindeerResponse(intent, session, callback)
  }
  else if (intentName == "Amazon.YesIntent") {
    handleYesResponse(intent, session, callback)
  }
  else if (intentName == "AMAZON.NoIntent") {
    handleNoResponse(intent, session, callback)
  }
  else if (intentName == "AMAZON.HelpIntent") {
    handleGetHelpRequest(intent, session, callback)
  }
  else if (intentName == "AMAZON.StopIntent") {
    handleFinishSessionRequest(intent, session, callback)
  }
  else if (intentName == "AMAZON.CancelIntent") {
    handleFinishSessionRequest(intent, session, callback)
  }
  else {
    throw "invalid intent"
  }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
  var speechOutput = "Welcome to Reindeer Facts! I can tell you about all the famous reindeer: " +
    "Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Blitzen, Rudolph, and Olive." +
    "I can only give facts about one at a time. Which reindeer are you interested in?"

  var reprompt = "Which reindeer are you interested in? You can find out about Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Blitzen, Rudolph, and Olive."

  //Cards support 
  var header = "Reindeer Games!"

  var shouldEndSession = false

  //objects to hold stuff we need access to conviently
  var sessionAttributes = {
    "speechOutput": speechOutput,
    "repromptText": reprompt
  }

  //To keep constantly keep all these attributes in memory
  callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

handleReindeerResponse(intent, session, callback) {
  var reindeer = intent.slots.Reindeer.value.toLowerCase()

  if (!reindeer[reindeer]) {
    var speechOutput = "I am not familiar with this reindeer, maybe its a less famous cousin.  I only know Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Blitzen, Rudolph, and Olive"
    var repromptText = "Let me know another reindeer, I know you want to"
  } else {
    var personality_trait = reindeers[reindeer].personality_trait
    var skill = reindeers[reindeer].skill
    var speechOutput = capitalizeFirst(reindeer) + " " + personality_trait + " and " + skill + ". Do you want to hear about more reindeer?"
    var repropmtText = "Do you want to hear about more reindeer?"
  }

  var shouldEndSession = false

  callback(session.attribute, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleYesResponse(intent, session, callback) {
  var speechOutput = "Great! Which reindeer? You can find out about Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Blitzen, Rudolph, and Olive"
  var repromptText = speechOutput
  var shouldEndSession = false

  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleNoResponse(intent, session, callback) {
  handleFinishSessionRequest(intent, session, callback)

}

function handleGetHelpRequest(intent, session, callback) {

  var shouldEndSession = false
  // Ensure that session.attributes has been initialized
  if (!session.attributes) {
    session.attributes = {};
  }

  var speechOutput = "I can tell you facts about all the famous reindeer: " +
    "Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Blitzen, Rudolph, and Olive." +
    " Which reindeer are you interested in? Remember, I can only give facts about one reindeer at a time."

  var repromptText = speechOutput

  callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))

}

function handleFinishSessionRequest(intent, session, callback) {
  // End the session with a "Good bye!" if the user wants to quit the game
  callback(session.attributes,
    buildSpeechletResponseWithoutCard("See you next time! Thank you for using Reindeer Games", "", true));
}


// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: title,
      content: output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}

//Attribution: stackoverflow, because I still need more practice in data manipulation 
function capitalizeFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}