import "dotenv/config";

export default {
  expo: {
    plugins: ["expo-sqlite"],
    name: "TapTrack",
    slug: "taptrack",

    extra: {
      apiUrl: process.env.API_URL,
      eas: {
        projectId: "cb5dddc4-766c-45d7-997b-6309723eb188",
      },
    },

    android: {
      package: "com.app.taptrack",
    },
  },
};
