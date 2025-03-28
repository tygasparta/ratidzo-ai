# Ratidzo Health AI

<p align="center">
  <img src="assets/ratidzo-logo.svg" alt="Ratidzo Health AI Logo" width="120"/>
</p>

Ratidzo Health AI is an intelligent health assistant platform that provides non-prescriptive health insights based on user symptoms. Built with South African health needs in mind, it incorporates features like AI-powered symptom analysis and a chat interface for interactive health queries.

## ✨ Features

- 🤖 **AI-Powered Health Analysis**: Describe your symptoms and receive possible health conditions, urgency indicators, and home remedies.
- 💬 **Interactive Chat Interface**: Chat with the AI assistant to discuss your health concerns.
- 🔒 **Privacy-Focused**: Your health data is secure and private.
- 📱 **Responsive Design**: Optimized for both mobile and desktop users.
- ⚡ **Real-time Interaction**: Get immediate responses to your health queries.
- 📄 **PDF Reports**: Generate and download health reports for your records.

## 🚀 Demo

Access the live demo of Ratidzo Health AI at [ratidzo.com](https://ratidzo.com).

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **AI Integration**: DeepSeek AI API
- **Deployment**: PHP for API proxy on cPanel hosting

## 📋 Deployment Options

### cPanel Deployment (Recommended)

We've created an easy deployment package specifically for cPanel hosting:

1. Download the [ratidzo-cpanel-ready.zip](https://github.com/tygasparta/ratidzo-ai/raw/main/ratidzo-cpanel-ready.zip) file
2. Upload and extract it to your cPanel hosting's public_html directory
3. Set appropriate file permissions (755 for directories, 644 for files)
4. Update API keys in the PHP proxy files if needed

### Node.js Deployment (Development)

For local development or Node.js hosting:

1. Clone the repository
   ```
   git clone https://github.com/tygasparta/ratidzo-ai.git
   cd ratidzo-ai
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
   node serve.js
   ```

## 📂 Project Structure

```
ratidzo-ai/
├── css/                     # Stylesheets
│   ├── main.css             # Main application styles
│   └── chat.css             # Chat interface styles
├── js/                      # JavaScript files
│   ├── main.js              # Core application functionality
│   ├── chat.js              # Chat interface functionality
│   └── chat-fix.js          # Chat button handler
├── easy-cpanel-deploy/      # Optimized deployment package for cPanel
│   ├── api-proxy.php        # PHP proxy for chat API
│   ├── api-proxy-diagnose.php # PHP proxy for diagnosis API
│   └── ...                  # Other deployment files
├── index.html               # Main application HTML
├── .env.example             # Environment variables template
└── serve.js                 # Node.js development server
```

## 📊 Features In Detail

### Health Analysis
Users can input their symptoms, age, gender, and other health information to receive AI-powered insights about possible health conditions, their likelihood, and recommended actions.

### Chat Interface
The interactive chat interface allows users to have conversations about their health concerns. The AI assistant provides helpful information while clearly stating it's not a replacement for professional medical advice.

### PDF Reports
Users can generate and download detailed health reports based on their symptom analysis, which can be shared with healthcare providers.

## 🔗 API Integration

Ratidzo Health AI integrates with the DeepSeek AI API to provide intelligent health insights. The integration is handled through:

- Direct JavaScript API calls in development environments
- PHP proxy files in cPanel deployment to avoid CORS issues and hide API keys

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

Ratidzo Health AI is not a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 👏 Acknowledgements

- [DeepSeek AI](https://deepseek.ai) for AI capabilities
- All contributors who have helped shape this project
- South African Department of Health for healthcare standards guidance 