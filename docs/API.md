# Jules API

## Introduction
The Jules API lets you programmatically access Jules's capabilities to automate and enhance your software development lifecycle. You can use the API to create custom workflows, automate tasks like bug fixing and code reviews, and embed Jules's intelligence directly into the tools you use every day, such as Slack, Linear, and GitHub.

> **Note:** The Jules API is in an alpha release, which means it is experimental. Be aware that we may change specifications, API keys, and definitions as we work toward stabilization. In the future, we plan to maintain at least one stable and one experimental version.

## Authentication

### Generate Your API Key
In the Jules web app, go to the [Settings](https://jules.google.com/settings#api) page to create a new API key. You can have at most 3 API keys at a time.

### Use Your API Key
To authenticate your requests, pass the API key in the `X-Goog-Api-Key` header of your API calls.

```http
X-Goog-Api-Key: YOUR_API_KEY
```

> **Important:** Keep your API keys secure. Don't share them or embed them in public code. For your protection, any API keys found to be publicly exposed will be [automatically disabled](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-service-accounts#disable-exposed-keys) to prevent abuse.

## API Concepts
The Jules API is built around a few core resources. Understanding these will help you use the API effectively.

## Quickstart: Your first API call

### Step 1: List your available sources
First, you need to find the name of the source you want to work with (e.g., your GitHub repo). This command will return a list of all sources you have connected to Jules.

**Request:**
```bash
curl 'https://jules.googleapis.com/v1alpha/sources' \
  -H 'X-Goog-Api-Key: YOUR_API_KEY'
```

**Response:**
```json
{
  "sources": [
    {
      "name": "sources/github/bobalover/boba",
      "id": "github/bobalover/boba",
      "githubRepo": {
        "owner": "bobalover",
        "repo": "boba"
      }
    }
  ],
  "nextPageToken": "github/bobalover/boba-web"
}
```

### Step 2: Create a new session
Now, create a new session. You'll need the source name from the previous step. This request tells Jules to create a boba app in the specified repository.

**Request:**
```bash
curl 'https://jules.googleapis.com/v1alpha/sessions' \
  -X POST \
  -H "Content-Type: application/json" \
  -H 'X-Goog-Api-Key: YOUR_API_KEY' \
  -d '{
    "prompt": "Create a boba app!",
    "sourceContext": {
      "source": "sources/github/bobalover/boba",
      "githubRepoContext": {
        "startingBranch": "main"
      }
    },
    "automationMode": "AUTO_CREATE_PR",
    "title": "Boba App"
  }'
```

The `automationMode` field is optional. By default, no PR will be automatically created.

**Immediate Response:**
```json
{
  "name": "sessions/31415926535897932384",
  "id": "31415926535897932384",
  "title": "Boba App",
  "sourceContext": {
    "source": "sources/github/bobalover/boba",
    "githubRepoContext": {
      "startingBranch": "main"
    }
  },
  "prompt": "Create a boba app!"
}
```

You can poll the latest session information using `GetSession` or `ListSessions`. For example, if a PR was automatically created, you can see the PR in the session output.

**Session Output with PR:**
```json
{
  "name": "sessions/31415926535897932384",
  "id": "31415926535897932384",
  "title": "Boba App",
  "sourceContext": {
    "source": "sources/github/bobalover/boba",
    "githubRepoContext": {
      "startingBranch": "main"
    }
  },
  "prompt": "Create a boba app!",
  "outputs": [
    {
      "pullRequest": {
        "url": "https://github.com/bobalover/boba/pull/35",
        "title": "Create a boba app",
        "description": "This change adds the initial implementation of a boba app."
      }
    }
  ]
}
```

By default, sessions created through the API will have their plans automatically approved. If you want to create a session that requires explicit plan approval, set the `requirePlanApproval` field to `true`.

### Step 3: Listing sessions
You can list your sessions as follows.

**Request:**
```bash
curl 'https://jules.googleapis.com/v1alpha/sessions?pageSize=5' \
  -H 'X-Goog-Api-Key: YOUR_API_KEY'
```

### Step 4: Approve plan
If your session requires explicit plan approval, you can approve the latest plan as follows:

**Request:**
```bash
curl 'https://jules.googleapis.com/v1alpha/sessions/SESSION_ID:approvePlan' \
  -X POST \
  -H "Content-Type: application/json" \
  -H 'X-Goog-Api-Key: YOUR_API_KEY'
```

### Step 5: Activities and interacting with the agent

**List Activities:**
To list activities in a session:
```bash
curl 'https://jules.googleapis.com/v1alpha/sessions/SESSION_ID/activities?pageSize=30' \
  -H 'X-Goog-Api-Key: YOUR_API_KEY'
```

**Send Message:**
To send a message to the agent:
```bash
curl 'https://jules.googleapis.com/v1alpha/sessions/SESSION_ID:sendMessage' \
  -X POST \
  -H "Content-Type: application/json" \
  -H 'X-Goog-Api-Key: YOUR_API_KEY' \
  -d '{ "prompt": "Can you make the app corgi themed?" }'
```

**Example ListActivities Response:**
```json
{
  "activities": [
    {
      "name": "sessions/14550388554331055113/activities/02200cce44f746308651037e4a18caed",
      "createTime": "2025-10-03T05:43:42.801654Z",
      "originator": "agent",
      "planGenerated": {
        "plan": {
          "id": "5103d604240042cd9f59a4cb2355643a",
          "steps": [
            {
              "id": "705a61fc8ec24a98abc9296a3956fb6b",
              "title": "Setup the environment. I will install the dependencies to run the app."
            },
            {
              "id": "bb5276efad354794a4527e9ad7c0cd42",
              "title": "Modify `src/App.js`. I will replace the existing React boilerplate with a simple Boba-themed component. This will include a title and a list of boba options.",
              "index": 1
            },
            {
              "id": "377c9a1c91764dc794a618a06772e3d8",
              "title": "Modify `src/App.css`. I will update the CSS to provide a fresh, modern look for the Boba app.",
              "index": 2
            },
            {
              "id": "335802b585b449aeabb855c722cd9c40",
              "title": "Frontend Verification. I will use the `frontend_verification_instructions` tool to get instructions on how to write a Playwright script to verify the frontend application and generate a screenshot of the changes.",
              "index": 3
            },
            {
              "id": "3e4cc97c7b2448668d1ac75b8c7b7d69",
              "title": "Submit the changes. Once the app is looking good and verified, I will submit my work.",
              "index": 4
            }
          ]
        }
      },
      "id": "02200cce44f746308651037e4a18caed"
    },
    {
      "name": "sessions/14550388554331055113/activities/2918fac8bc54450a9cbda423b7688413",
      "createTime": "2025-10-03T05:43:44.954030Z",
      "originator": "user",
      "planApproved": {
        "planId": "5103d604240042cd9f59a4cb2355643a"
      },
      "id": "2918fac8bc54450a9cbda423b7688413"
    },
    {
      "name": "sessions/14550388554331055113/activities/db089c7052024cbeb9e37b8c584bc964",
      "createTime": "2025-10-03T05:47:53.669642Z",
      "originator": "agent",
      "progressUpdated": {
        "title": "I have successfully verified the frontend changes by building the app, running a Playwright script, and inspecting the resulting screenshot.",
        "description": "I have successfully verified the frontend changes by building the app, running a Playwright script, and inspecting the resulting screenshot."
      },
      "artifacts": [
        {
          "changeSet": {
            "source": "sources/github/bobalover/boba",
            "gitPatch": {
              "unidiffPatch": "",
              "baseCommitId": "36ead0a4caefc451b9652ed926a15af9570f4f35"
            }
          }
        }
      ],
      "id": "db089c7052024cbeb9e37b8c584bc964"
    },
    {
      "name": "sessions/14550388554331055113/activities/022837dbc0e940eabcc1bc53608e15fc",
      "createTime": "2025-10-03T05:48:35.523200Z",
      "originator": "agent",
      "sessionCompleted": {},
      "artifacts": [
        {
          "changeSet": {
            "source": "sources/github/bobalover/boba",
            "gitPatch": {
              "unidiffPatch": "",
              "baseCommitId": "36ead0a4caefc451b9652ed926a15af9570f4f35",
              "suggestedCommitMessage": "feat: Create simple Boba App\n\nThis commit transforms the default Create React App boilerplate into a simple, visually appealing Boba-themed application."
            }
          }
        }
      ],
      "id": "022837dbc0e940eabcc1bc53608e15fc"
    }
  ]
}
```

## Additional API Methods

### Get Source
Retrieve a single source by its name.

**Request:**
```bash
curl 'https://jules.googleapis.com/v1alpha/sources/github/owner/repo' \
  -H 'X-Goog-Api-Key: YOUR_API_KEY'
```

**Response:**
```json
{
  "name": "sources/github/bobalover/boba",
  "id": "github/bobalover/boba",
  "githubRepo": {
    "owner": "bobalover",
    "repo": "boba"
  }
}
```

### Get Activity
Retrieve a single activity by its name.

**Request:**
```bash
curl 'https://jules.googleapis.com/v1alpha/sessions/SESSION_ID/activities/ACTIVITY_ID' \
  -H 'X-Goog-Api-Key: YOUR_API_KEY'
```

**Response:**
```json
{
  "name": "sessions/31415926535897932384/activities/abc123",
  "id": "abc123",
  "createTime": "2025-10-03T05:43:42.801654Z",
  "originator": "agent",
  "planGenerated": {
    "plan": {
      "id": "5103d604240042cd9f59a4cb2355643a",
      "steps": [...]
    }
  }
}
```
