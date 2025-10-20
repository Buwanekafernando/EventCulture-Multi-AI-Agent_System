EventCulture – Multi-Agent Event Finder (Sri Lanka)

EventCulture is a smart, AI-powered multi-agent event finder web application designed to help users discover both physical and virtual events happening across Sri Lanka.
The system uses five intelligent agents to collect, analyze, recommend, and guide users toward events that match their preferences.

Overview

EventCulture makes event discovery simple and intelligent.
It offers two types of user versions:

Free Version: Users have limited access to event recommendations and features.

Pro Version: Users enjoy full access with advanced features such as personalized recommendations, unlimited searches, and enhanced navigation.

 Multi-Agent System Architecture

EventCulture is powered by five core agents, each responsible for specific intelligent behaviors.

1) Event Collector Agent

This agent gathers event information from external sources such as Google and Bing.

Collects event details (name, location, time, type, etc.)

Stores them in the event database table

Automatically updates the latest events

Removes outdated or cancelled event entries

2) NLP Agent

This agent processes event data using Natural Language Processing (NLP) techniques.

Summarizes event descriptions

Classifies event types (e.g., Music, Tech, Art, Sports, etc.)

Performs sentiment analysis on event content

Updates the event table with enhanced, meaningful metadata

3) Recommendation Agent

This agent powers the event recommendation system.

Filters events based on user preferences and selected categories

Manages Free vs. Pro user limits (e.g., limited search access for free users)

Displays trending events based on view counts analyzed by the Analysis Agent

Continuously improves personalized suggestions

4) Location Agent

This agent assists users in navigating to the event location.

Displays routes from the user’s location to the event venue

Provides travel options: By Bus, By Car, or Walking

Includes popular landmarks such as bus stands and railway stations across Sri Lanka

In future updates, it will allow users to enter their location directly and see real-time directions on an interactive map

5) Analysis Agent

This agent tracks and analyzes event popularity.

Records user interactions, such as views and clicks

Evaluates event engagement trends

Provides insights to improve event ranking and recommendation quality

💡 Features

Event discovery (physical & virtual events in Sri Lanka)

 Interactive location and direction guidance

 AI-driven recommendations and personalization

 (Upcomming )Sentiment-based event tagging

 Event trend analysis and popularity tracking
 Dual user modes: Free and Pro

(Upcoming) Payment system for Pro users and paid events

 (Upcoming) Emotion-aware recommendations using user sentiment and preferences

🎨 User Interface

The UI is designed to be clean, responsive, and user-friendly, allowing users to:

Browse daily and upcoming events effortlessly

Filter events by type, date, or location

View detailed event cards with location maps and directions

Experience a smooth, modern design built for accessibility and clarity

🛠️ Upcoming Updates

🔧 Advanced user preference modification

💳 Integrated payment gateway for Pro subscriptions and paid events

❤️ Emotion-aware recommendation system (based on user mood and interest)

🗺️ Smarter route planning with traffic insights

⚙️ Technology Stack (Example)

(Adjust according to your actual setup)

Frontend: React.js
Backend: FastAPI / Python
Database: MySQL
AI & NLP: Gemini API/ SpaCy
Maps Integration: Google Maps API
Version Control: GitHub

About the Project

EventCulture is developed as a multi-agent AI project to enhance user experience in discovering, understanding, and attending events across Sri Lanka.
Each agent plays a vital role in creating an intelligent, automated ecosystem that connects people to experiences that matter.
