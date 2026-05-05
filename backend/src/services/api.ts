import axios from "axios";
import Constants from "expo-constants";

const API = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
});

export default API;
