# EduSpeak: NCE Training Hub

### Featured app created by Adesina Isreal x SWAL Organization

Comprehensive training portal for NCE students in Nigeria, specializing in **English (Phonetics, Literature, Professional Communication)** and **Social Studies**.

## 🚀 Features
- **AI-Powered Professional Training**: Get custom study guides for English and Social Studies teaching pedagogy.
- **Dynamic Assessments**: Test your knowledge with AI-generated professional proficiency quizzes.
- **Phonetics Lab**: Interactive IPA chart with audio guides.
- **Literature Library**: Selective Nigerian and Classic literature with analysis.
- **Intelligent Dictionary**: AI-powered word discovery with phonetic transcriptions.
- **PWA Ready**: Install this app on your mobile device or desktop for offline access.

## 🛠️ Built With
- React 18 + Vite
- Gemini AI (Google Generative AI SDK)
- Firebase (Auth & Firestore)
- Tailwind CSS
- Framer Motion (Animations)
- Lucide React (Icons)

## 🌍 Deployment

This project is configured for **GitHub Pages** with automatic builds via GitHub Actions.

### Steps to Deploy:
1. **GitHub Secret**: Go to your GitHub Repository Settings > Secrets and variables > Actions.
2. Add a **New repository secret**:
   - Name: `GEMINI_API_KEY`
   - Value: *Your Google Gemini API Key*
3. **Enable Pages**: Go to Settings > Pages.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
4. **Push to Main**: Every push to the `main` branch will now automatically build and deploy the application.

---
© 2024 Adesina Isreal x SWAL Organization. Built to empower the next generation of educators.
