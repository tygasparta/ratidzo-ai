# Ratidzo Health AI

Ratidzo Health AI is an intelligent health assistant platform that provides non-prescriptive health insights based on user symptoms. Built with South African health needs in mind, it incorporates features like AI-powered symptom analysis and location-based healthcare finder.

## Features

- 🤖 **AI-Powered Health Analysis**: Describe your symptoms and receive possible health conditions, urgency indicators, and home remedies.
- 🗺️ **Healthcare Finder**: Find nearby clinics, pharmacies, and hospitals using geolocation.
- 🔒 **Privacy-Focused**: Your health data is secure and private.
- 📱 **Responsive Design**: Optimized for both mobile and desktop users.
- ⚡ **Real-time Interaction**: Get immediate responses to your health queries.

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **Database & Authentication**: Firebase Firestore
- **Backend Integration**: DeepSeek AI API for health insights
- **Location Services**: Google Maps API for healthcare facility finding

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase account
- DeepSeek AI API key
- Google Maps API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ratidzo-health-ai.git
   cd ratidzo-health-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`
   ```
   cp .env.example .env
   ```

4. Fill in the environment variables in the `.env` file

5. Start the development server
   ```
   npm run dev
   ```

## Project Structure

```
ratidzo-health-ai/
├── public/
├── src/
│   ├── components/
│   │   ├── chatbot/
│   │   │   ├── ChatInterface.tsx
│   │   │   └── FloatingChatButton.tsx
│   │   └── Logo.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useHealthcareFinder.ts
│   ├── services/
│   │   ├── deepseekAIService.ts
│   │   ├── firebase.ts
│   │   └── mapService.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── ...
```

## Usage

1. Open the web application in your browser
2. Click on the chat button in the bottom right corner
3. Describe your symptoms in natural language
4. Receive AI-generated health insights
5. Use the "Find healthcare nearby" button to locate clinics and pharmacies near you

## Future Enhancements

- Multi-language support with focus on South African languages
- Appointment scheduling with healthcare providers
- Medication reminders and tracking
- Doctor consultations through integrated telemedicine
- Mobile app version for Android and iOS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [DeepSeek AI](https://deepseek.ai) for AI capabilities
- [Google Maps Platform](https://cloud.google.com/maps-platform/) for location services
- South African Department of Health for healthcare standards guidance 