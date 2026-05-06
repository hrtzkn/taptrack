import axios from "axios";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  Constants.manifest2?.extra?.expoClient?.extra?.apiUrl ??
  "https://taptrack-itn2.onrender.com/api";

const API = axios.create({
  baseURL: API_URL,
});

export default API;
