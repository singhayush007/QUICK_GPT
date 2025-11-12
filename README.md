# 🤖 QuickGPT — Full Stack AI Chatbot (MERN + Gemini + ImageKit + Razorpay)

![QuickGPT Screenshot](./client/src/assets/Quickgpt.png)

QuickGPT is a **full-stack AI Chatbot application** built using the **MERN stack (MongoDB, Express, React, Node.js)**.  
It allows users to **generate AI-based text and images**, manage **credits**, and make **secure online payments** via Razorpay.  
The app integrates **Google Gemini** for text generation and **ImageKit** for AI image generation.

---

## 🧠 Features

- 🔐 **User Authentication (JWT)**
- 💬 **AI Text Generation** (Google Gemini)
- 🖼️ **AI Image Generation** (ImageKit)
- 💳 **Online Payment Integration** (Razorpay)
- 🪙 **Credit System** (Pay per use)
- 📦 **MongoDB Database** for storing user data & chat history
- ⚡ **Express.js Backend** with secure routes
- 💻 **Responsive Frontend** built using React + Tailwind CSS
- 🚀 **Deployed on Vercel**

---

## 💻 Tech Stack

| Technology                                                                                                     | Description                                                           |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ![React.js](https://img.shields.io/badge/React.js-61DAFB?style=flat&logo=react&logoColor=black)                | Frontend library for building dynamic and interactive user interfaces |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)                         | Next-generation frontend build tool for faster development            |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white) | Utility-first CSS framework for responsive UI design                  |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)                | JavaScript runtime environment for building the backend               |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)          | Fast, minimal web framework for Node.js                               |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)                | NoSQL database for storing users, chats, and transactions             |
| ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)             | Elegant MongoDB object modeling for Node.js                           |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)                      | HTTP client for making API requests between frontend & backend        |
| ![BcryptJS](https://img.shields.io/badge/BcryptJS-3385FF?style=flat)                                           | Password hashing & encryption for secure authentication               |
| ![CORS](https://img.shields.io/badge/CORS-FFB400?style=flat)                                                   | Middleware for handling cross-origin requests securely                |
| ![Dotenv](https://img.shields.io/badge/Dotenv-000000?style=flat)                                               | Loads environment variables from `.env` file                          |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)                  | Secure token-based user authentication                                |
| ![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay&logoColor=00AEEF)            | Online payment gateway for credit purchases                           |
| ![ImageKit](https://img.shields.io/badge/ImageKit-1D1D1D?style=flat&logo=imagekit&logoColor=00D9FF)            | Cloud image generation & optimization based on AI prompts             |
| ![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white)     | AI model integration for text generation                              |

---

## 🚀 Features

| Feature                          | Description                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 🧍‍♂️ **User Authentication**       | Secure user signup, login, and JWT-based authentication with password hashing using **bcryptjs**     |
| 💬 **AI Text Generation**        | Generate intelligent and creative text replies powered by **Google Gemini AI**                       |
| 🖼️ **AI Image Generation**       | Create stunning images from text prompts using **ImageKit AI**                                       |
| 💳 **Credit System**             | Each action consumes credits — users can purchase more credits via **Razorpay payment gateway**      |
| 🧾 **Razorpay Integration**      | Seamless online payment flow with webhook support for payment verification                           |
| 📦 **Plan Management**           | Multiple subscription plans with different credit limits and features                                |
| 📡 **Real-time Communication**   | Fast API communication between client and server via **Axios** and **Express.js**                    |
| 🧰 **Admin & User Management**   | Store and manage user data, chats, and transactions in **MongoDB** using **Mongoose**                |
| 🖥️ **Modern UI/UX**              | Built with **React.js** and **Tailwind CSS** for a clean, responsive, and interactive user interface |
| 🌐 **Environment Configuration** | Securely manage keys and configurations using **dotenv**                                             |
| ☁️ **Deployment Ready**          | Fully deployable MERN stack app with environment variables and production configurations             |

---

## 🗂️ Folder Structure

```
QuickGPT/
│
├── client/ # Frontend (React.js)
│ ├── public/ # Static assets (icons, images, etc.)
│ ├── src/ # Main source folder
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components (Login, Signup, Chat, etc.)
│ │ ├── context/ # Global context (Auth, Chat)
│ │ ├── hooks/ # Custom React hooks
│ │ ├── utils/ # Helper functions
│ │ ├── App.js # Main App component
│ │ └── index.js # Entry point
│ ├── .env # Frontend environment variables
│ ├── package.json # React dependencies and scripts
│ └── vite.config.js # Vite configuration (if using Vite)
│
├── server/ # Backend (Node.js + Express.js)
│ ├── configs/ # Config files (DB, ImageKit, OpenAI, etc.)
│ ├── controllers/ # Route controllers (User, Chat, Webhook, etc.)
│ ├── middlewares/ # Authentication middleware
│ ├── models/ # MongoDB Models (User, Chat, Transaction)
│ ├── routes/ # API routes
│ ├── server.js # Main Express server file
│ ├── .env # Backend environment variables
│ ├── package.json # Backend dependencies and scripts
│ └── nodemon.json # Dev configuration (optional)
│
├── .gitignore # Files ignored by Git
├── README.md # Project documentation
└── package.json # Root-level configuration (if using concurrently)
```

## 🏁 Getting Started

Follow these steps to run the project locally:

1. **Clone the repository:**

```
git clone https://github.com/singhayush007/QUICK_GPT.git
```

2. **Navigate to the project folder:**

```
cd QUICK_GPT
```

3. **Install dependencies:**

```
npm install
```

4. **Create a .env.local file in the root and add your environment variables:**

```
JWT_SECRET=your_jwt_secret

# MongoDB URI
MONGODB_URI=your_mongodb_connection_uri

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

5. **Run the development server and client:**

```
cd client : npm run dev
cd server : npm run server
```

6. **Open the app in your browser:**

```
http://localhost:5173
```

## 💻 Deployment

You can deploy this app using Vercel, Docker, or any Node.js hosting platform.

## 📄 License

This project is licensed under the MIT License — feel free to use and modify it as per your needs.
