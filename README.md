# Real-Time Translation Web Application for Meetings

## Description

This web application enables real-time translation in virtual meetings, supporting both text and speech. It uses advanced translation and speech synthesis so each participant can hear others in their preferred language, as if everyone spoke the same language. At the end of the meeting, users can generate an automatic meeting summary powered by artificial intelligence.

## Key Features

- Real-time translation of text and voice for multiple meeting participants.
- Synthetic voice (Text-to-Speech) speaks translations aloud in the selected language.
- AI-powered meeting summary available after each session.
- Simple, modern, and responsive web interface.
- Automatic detection of input language.
- Conversation and audio history.

## Technologies Used

- **Frontend:** React / Next.js  
- **Backend:** Node.js + Express or NestJS  
- **Translation APIs:** Google Cloud Translation, Azure Translator  
- **Speech Processing:** Web Speech API, Google Cloud Text-to-Speech  
- **AI Summarization:** OpenAI GPT, Azure OpenAI, or similar  
- **Database:** PostgreSQL or MongoDB  
- **Deployment:** Vercel, AWS, Azure, or similar

## Installation & Usage

1. Clone this repository:
    ```bash
    git clone https://github.com/youruser/your-realtime-meeting-translation.git
    ```


## User Stories

### End User

#### Story 1: Real-Time Multilingual Meeting  
**As** a meeting participant,  
**I want** to speak in my own language and hear other participants in my language through a synthetic voice,  
**so that** I can fully participate in multilingual meetings as if everyone spoke my language.

**Acceptance Criteria:**  
- The user can join a meeting and speak in their language.
- The system detects the input language, translates, and outputs translated speech via Text-to-Speech in real time for each participant.
- Latency of translation and voice output is 2 seconds or less.

---

#### Story 2: Real-Time Text and Chat Translation  
**As** a meeting participant,  
**I want** to send written messages that are automatically translated for other participants,  
**so that** written communication in meetings is barrier-free.

**Acceptance Criteria:**  
- The user can send chat messages during the meeting.
- The system automatically translates and displays messages in each participant’s chosen language.
- Chat translations appear in less than 2 seconds.

---

#### Story 3: AI-Powered Meeting Summary  
**As** a user,  
**I want** to receive an AI-generated summary of the meeting,  
**so that** I can quickly review the most important points and actions.

**Acceptance Criteria:**  
- After the meeting, the user can request a summary.
- The system uses an AI API to generate and display a concise, accurate meeting summary.

---

#### Story 4: Conversation and Audio History  
**As** a user,  
**I want** to access the meeting transcript and audio history,  
**so that** I can review previous discussions and translations.

**Acceptance Criteria:**  
- The user can view transcripts and, optionally, listen to past meeting translations.
- The system securely stores and retrieves audio and text history.

---

## Acceptance Criteria (Checklist)

- [ ] Users can join a virtual meeting and communicate in their own language.
- [ ] The system translates and speaks each participant’s input in real time via synthetic voice.
- [ ] Chat messages are translated automatically for each participant.
- [ ] AI-generated meeting summaries are available after each meeting.
- [ ] Users can access meeting transcripts and (optionally) audio playback.
- [ ] Translation and voice output have 2 seconds or less latency.
- [ ] The UI is responsive and works on desktop and mobile browsers.
- [ ] The app works correctly on major
