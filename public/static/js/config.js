// import dotenv from "dotenv";

const NODE_ENV = "development";

export const socketURL = NODE_ENV === "production" ? "https://pik-soc.sauravmh.me" : "http://localhost:3002";
export const httpURL = NODE_ENV === "production" ? "https://piksy.sauravmh.me" : "http://localhost:3001";

console.log(socketURL, httpURL);
